import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from 'react-router-dom';
import {
  useQuery,
  // useMutation 
} from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
// import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const params = useParams();
  const submit = useSubmit();

  const { data,
    // isPending, 
    isError, error
  } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   /**
  //    * It is called the moment we call mutate.
  //    * @param {*} data is passed automatically by onMutate
  //    */
  //   onMutate: async (data) => {
  //     // we cancel any ongoing queries to avoid clash problems
  //     await queryClient.cancelQueries({ queryKey: ['events', params.id] });
  //     const previousEvent = queryClient.getQueryData(['events', params.id]);
  //     queryClient.setQueryData(['events', params.id], data.event); // manipulates stored data

  //     return { previousEvent }; // this object will be passed to onError's context
  //   },
  //   // called if mutationFn fails
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', params.id], context.previousEvent);
  //   },
  //   // called when mutationFn is finished, no matter if it failed or succeeded. We use it as a failsafe in order to have valid data in the end
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', params.id]);
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({
    //   id: params.id,
    //   event: formData,
    // });
    // navigate('../');

    submit(formData, { method: 'PUT' }); // method here can be anything but 'GET'
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  // if (isPending) {
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

  /**
   * We can also remove this and use router error functionality.
   */
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
        {state === 'submitting' ? <p>Sending data...</p> : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export function loader({ params }) {
  /**
   * Trigger a query programmatically, without using useQuery.
   * It is a good practice to keep useQuery in this component, since it will use the cached data from the loader and we will have all the benefits from it.
   */
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

/**
 * !!This action does not support Optimistic event updating!!
 * @param {*} param0 
 */
export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(['events']);
  return redirect('../');
}