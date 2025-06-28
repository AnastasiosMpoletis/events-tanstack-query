import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'], // it will also invalidate the query in FindEventSection that has 'events' as an id along with other ids and similar queries with multiple ids
        // exact: true, // in case we want to invalidate queries that have exactly that queryKey
      });
      navigate('/events');
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>

        {isPending && 'Submitting...'}

        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}

      </EventForm>

      {isError && (
        <ErrorBlock
          title='Failed to create event'
          message={error.info?.message || 'Failed to create event. Please check your inputs and try again later.'}
        />
      )}

    </Modal>
  );
}
