import { useQuery } from '@tanstack/react-query';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';

import { fetchEvents } from '../../util/http.js'

export default function NewEventsSection() {
  /**
   * Make sure to return an Error in fetchEvents, in case of an error.
   */
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events'], // use it to help data caching
    queryFn: fetchEvents,
    staleTime: 5000, // if we re-render the component within 5 seconds, no data will be fetched from cache. Default value: 0.
    // gcTime: 30000, // garbage collector. How long the cache lasts. Cached data will be kept around for half a minute. Default value: 5 minutes.
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
