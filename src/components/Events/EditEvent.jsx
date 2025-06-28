import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    /**
     * It is called the moment we call mutate.
     * @param {*} data is passed automatically by onMutate
     */
    onMutate: async (data) => {
      // we cancel any ongoing queries to avoid clash problems
      await queryClient.cancelQueries({ queryKey: ['events', params.id] });
      const previousEvent = queryClient.getQueryData(['events', params.id]);
      queryClient.setQueryData(['events', params.id], data.event); // manipulates stored data

      return { previousEvent }; // this object will be passed to onError's context
    },
    // called if mutationFn fails
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', params.id], context.previousEvent);
    },
    // called when mutationFn is finished, no matter if it failed or succeeded. We use it as a failsafe in order to have valid data in the end
    onSettled: () => {
      queryClient.invalidateQueries(['events', params.id]);
    },
  });

  function handleSubmit(formData) {
    mutate({
      id: params.id,
      event: formData,
    });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title='Failed to load event'
          message={error.info?.message || 'Failed to load event. Please check your inputs and try again later.'}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
