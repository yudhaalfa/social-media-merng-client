import React, { useContext, useRef, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Button,
  Card,
  Form,
  Grid,
  Icon,
  Image,
  Label,
} from 'semantic-ui-react';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import LikeButton from '../parts/LikeButton';
import DeleteButton from '../parts/DeleteButton';
import { AuthContext } from '../context/auth';
import Pop from '../utils/Pop';

function Content(props) {
  const postId = props.match.params.postId;
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const commentInputRef = useRef(null);

  const { data: { getPost } = {} } = useQuery(FETCH_POST_QUERY, {
    variables: {
      postId,
    },
  });

  const [comment, setComment] = useState('');

  const [postComment] = useMutation(POST_COMMENT_MUTATION, {
    update() {
      setComment('');
      commentInputRef.current.blur();
    },
    variables: {
      postId,
      body: comment,
    },
  });

  function deletePostCallBack() {
    history.push('/');
  }

  let postMarkup;
  if (!getPost) {
    postMarkup = <p>Loading post...</p>;
  } else {
    const {
      id,
      body,
      createdAt,
      username,
      comments,
      likes,
      likeCount,
      commentCount,
    } = getPost;

    postMarkup = (
      <>
        <Grid>
          <Grid.Row>
            <Grid.Column width={2}>
              <Image
                src='https://react.semantic-ui.com/images/avatar/large/molly.png'
                size='small'
                floated='right'
              />
            </Grid.Column>
            <Grid.Column width={10}>
              <Card fluid>
                <Card.Content>
                  <Card.Header>{username}</Card.Header>
                  <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
                  <Card.Description>{body}</Card.Description>
                </Card.Content>
                <hr />
                <Card.Content extra>
                  <LikeButton user={user} post={{ id, likeCount, likes }} />
                  <Pop content='Comment on Post'>
                    <Button
                      as='div'
                      labelPosition='right'
                      onClick={() => console.log('Comment on post')}>
                      <Button basic color='blue'>
                        <Icon name='comments' />
                      </Button>
                      <Label basic color='blue' pointing='left'>
                        {commentCount}
                      </Label>
                    </Button>
                  </Pop>
                  {user && user.username === username && (
                    <DeleteButton postId={id} callback={deletePostCallBack} />
                  )}
                </Card.Content>
              </Card>
              {user && (
                <Card fluid>
                  <Card.Content>
                    <p>Post a comment</p>
                    <Form>
                      <div className='ui action input fluid'>
                        <input
                          type='text'
                          placeholder='Comment...'
                          name='comment'
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          ref={commentInputRef}
                        />
                        <button
                          type='submit'
                          className='ui button teal'
                          disabled={comment.trim() === ''}
                          onClick={postComment}>
                          Comment
                        </button>
                      </div>
                    </Form>
                  </Card.Content>
                </Card>
              )}
              {comments.map((comment) => (
                <Card fluid key={comment.id}>
                  <Card.Content>
                    {user && user.username === comment.username && (
                      <DeleteButton postId={id} commentId={comment.id} />
                    )}
                    <Card.Header>{comment.username}</Card.Header>
                    <Card.Meta>{moment(comment.createdAt).fromNow()}</Card.Meta>
                    <Card.Description>{comment.body}</Card.Description>
                  </Card.Content>
                </Card>
              ))}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </>
    );
  }
  return postMarkup;
}

const POST_COMMENT_MUTATION = gql`
  mutation($postId: String!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      id
      comments {
        id
        body
        createdAt
        username
      }
      commentCount
    }
  }
`;

const FETCH_POST_QUERY = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      createdAt
      username
      likeCount
      likes {
        username
      }
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`;

export default Content;
