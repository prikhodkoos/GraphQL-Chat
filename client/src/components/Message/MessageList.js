import React from 'react';
import { Query } from 'react-apollo';
import MessageItem from './MessageItem';
import { MESSAGE_QUERY, NEW_MESSAGES_SUBSCRIPTION, NEW_REACTIONS_SUBSCRIPTION } from '../../queries';

const MessageList = props => {
  const orderBy = 'createdAt_DESC';

  const _subscribeToNewMessages = subscribeToMore => {
    subscribeToMore({
      document: NEW_MESSAGES_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const { newMessage } = subscriptionData.data;
        const exists = prev.messages.messageList.find(({ id }) => id === newMessage.id);
        if (exists) return prev;

        return {...prev, messages: {
          messageList: [newMessage, ...prev.messages.messageList],
          count: prev.messages.messageList.length + 1,
          __typename: prev.messages.__typename
        }};
      }
    });
  };

  const _subscribeToNewReactions = subscribeToMore => {
    subscribeToMore({
      document: NEW_REACTIONS_SUBSCRIPTION
    });
  };

  return (
    <Query query={MESSAGE_QUERY} variables={{ orderBy }}>
      {({ loading, error, data, subscribeToMore }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Fetch error</div>;
        _subscribeToNewMessages(subscribeToMore);
        _subscribeToNewReactions(subscribeToMore);

        const { messages: { messageList } } = data;

        return (
          <div className="message-list">
            {messageList.map(item => {
              return <MessageItem key={item.id} {...item} />
            })}
          </div>
        );
      }}
    </Query>
  );
};

export default MessageList;
