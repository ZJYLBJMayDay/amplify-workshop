// // src/App.js
// import React, { useState, useEffect } from "react";

// // import API from Amplify library
// import { API, Auth } from "aws-amplify";

// // import query definition
// import { listTodos } from "./graphql/queries";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";

// function App() {
//   const [todos, setTodos] = useState([]);
//   useEffect(() => {
//     fetchTodos();
//     checkUser(); // new function call
//   });
//   async function checkUser() {
//     const user = await Auth.currentAuthenticatedUser();
//     console.log("user: ", user);
//     console.log("user attributes: ", user.attributes);
//   }

//   async function fetchTodos() {
//     try {
//       const postData = await API.graphql({ query: listTodos });
//       setTodos(postData.data.listTodos.items);
//     } catch (err) {
//       console.log({ err });
//     }
//   }
//   return (
//     <div>
//       <h1>Hello World</h1>
//       <AmplifySignOut />
//       {todos.map((todo) => (
//         <div key={todo.id}>
//           <h3>{todo.name}</h3>
//           <p>{todo.location}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
// export default withAuthenticator(App);
// src/App.js
// import React, { useState, useEffect } from "react";
// import { Storage } from "aws-amplify";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
// import { v4 as uuid } from "uuid";

// function App() {
//   const [images, setImages] = useState([]);
//   useEffect(() => {
//     fetchImages();
//   }, []);
//   async function fetchImages() {
//     // Fetch list of images from S3
//     let s3images = await Storage.list("");
//     // Get presigned URL for S3 images to display images in app
//     s3images = await Promise.all(
//       s3images.map(async (image) => {
//         const signedImage = await Storage.get(image.key);
//         return signedImage;
//       })
//     );
//     setImages(s3images);
//   }
//   function onChange(e) {
//     if (!e.target.files[0]) return;
//     const file = e.target.files[0];
//     // upload the image then fetch and rerender images
//     Storage.put(uuid(), file).then(() => fetchImages());
//   }

//   return (
//     <div>
//       <h1>Photo Album</h1>
//       <span>Add new image</span>
//       <input type="file" accept="image/png" onChange={onChange} />
//       <div style={{ display: "flex", flexDirection: "column" }}>
//         {images.map((image) => (
//           <img src={image} style={{ width: 400, marginBottom: 10 }} />
//         ))}
//       </div>
//       <AmplifySignOut />
//     </div>
//   );
// }

// export default withAuthenticator(App);

import React, { useState, useEffect } from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { css } from "@emotion/css";
import { API, Storage, Auth } from "aws-amplify";
import { listTodos } from "./graphql/queries";

import Posts from "./Posts";
import Post from "./Post";
import Header from "./Header";
import CreatePost from "./CreatePost";
import Button from "./Button";

function Router() {
  /* create a couple of pieces of initial state */
  const [showOverlay, updateOverlayVisibility] = useState(false);
  const [posts, updatePosts] = useState([]);

  /* fetch posts when component loads */
  useEffect(() => {
    fetchPosts();
  }, []);
  async function fetchPosts() {
    /* query the API, ask for 100 items */
    let postData = await API.graphql({
      query: listTodos,
      variables: { limit: 100 },
    });
    let postsArray = postData.data.listTodos.items;
    /* map over the image keys in the posts array, get signed image URLs for each image */
    postsArray = await Promise.all(
      postsArray.map(async (post) => {
        const imageKey = await Storage.get(post.image);
        post.image = imageKey;
        return post;
      })
    );
    /* update the posts array in the local state */
    setPostState(postsArray);
  }
  async function setPostState(postsArray) {
    updatePosts(postsArray);
  }
  return (
    <>
      <HashRouter>
        <div className={contentStyle}>
          <Header />
          <hr className={dividerStyle} />
          <Button
            title="New Post"
            onClick={() => updateOverlayVisibility(true)}
          />
          <Switch>
            <Route exact path="/">
              <Posts posts={posts} />
            </Route>
            <Route path="/post/:id">
              <Post />
            </Route>
          </Switch>
        </div>
        <AmplifySignOut />
      </HashRouter>
      {showOverlay && (
        <CreatePost
          updateOverlayVisibility={updateOverlayVisibility}
          updatePosts={setPostState}
          posts={posts}
        />
      )}
    </>
  );
}

const dividerStyle = css`
  margin-top: 15px;
`;

const contentStyle = css`
  min-height: calc(100vh - 45px);
  padding: 0px 40px;
`;

export default withAuthenticator(Router);
