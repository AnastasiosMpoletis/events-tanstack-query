import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import { useQuery, useMutation } from '@tanstack/react-query';

import Header from '../Header.jsx';

export default function EventDetails() {
  const navigate = useNavigate();
  const params = useParams('id');

  const { data, isPending } = useQuery({
    queryKey: ['event'],
    queryFn: () => fetchEvent(params),
  });

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'], // it will also invalidate the query in FindEventSection that has 'events' as an id along with other ids and similar queries with multiple ids
        // exact: true, // in case we want to invalidate queries that have exactly that queryKey
      });
      navigate('/events');
    },
  });

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">

        {isPending && <p>Loading event...</p>}

        {!isPending && (
          <>
            <header>
              <h1>{data.title}</h1>
              <nav>
                <button onClick={() => mutate(params)}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img src={`http://localhost:3000/${data.image}`} alt="event image" />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>{data.time}</time>
                </div>
                <p id="event-details-description">{data.description}</p>
              </div>
            </div>
          </>
        )}

      </article>
    </>
  );
}
