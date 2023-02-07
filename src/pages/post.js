import { auth, db } from "utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

export default function Post() {
  //Form State
  const [post, setPost] = useState({ description: "" });
  const [user, loading] = useAuthState(auth);
  const route = useRouter();
  const routeData = route.query;

  //Submit Post
  const submitPost = async (event) => {
    event.preventDefault();

    //Run checks for description
    if (!post.description) {
      toast.error("Description field empty 😅", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        toastId: "Empty",
      });
      return;
    }
    if (post.description.length > 300) {
      toast.error("Description too long 😅", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        toastId: "tooLong",
      });
      return;
    }

    if (post?.hasOwnProperty("id")) {
      const docRef = doc(db, "posts", post.id);
      const updatedPost = { ...post, timestamp: serverTimestamp() };
      await updateDoc(docRef, updatedPost);
      toast.success("Post has been edited 🧌", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        toastId: "madePost",
      });
      return route.push("/");
    } else {
      //Make a new post
      const collectionRef = doc(collection(db, "posts"));
      await setDoc(collectionRef, {
        ...post,
        timestamp: serverTimestamp(),
        user: user.uid,
        avatar: user.photoURL,
        username: user.displayName,
        id: collectionRef.id,
      });
      setPost({ description: "" });
      toast.success("Post has been made 🛫", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        toastId: "madePost",
      });
      return route.push("/");
    }
  };

  //Check out user
  const checkUser = async () => {
    if (loading) return;
    if (!user) route.push("/auth/login");
    if (routeData.id) {
      setPost({ description: routeData.description, id: routeData.id });
    }
  };

  useEffect(() => {
    checkUser();
  }, [user, loading]);

  return (
    <div className="my-20 p-12 shadow-lg rounded-lg max-w-md mx-auto">
      <form onSubmit={submitPost}>
        <h1 className="text-2xl font-bold">
          {post.hasOwnProperty("id") ? "Edit your post" : "Create a new post"}
        </h1>
        <div className="py-2">
          <h2 className="text-lg font-medium py-2">Description</h2>
          <textarea
            value={post.description}
            onChange={(event) =>
              setPost({ ...post, description: event.target.value })
            }
            className="bg-gray-800 h-48 w-full text-white rounded-lg p-2 text-sm"
          ></textarea>
          <p
            className={`text-cyan-600 font-medium text-sm ${
              post.description.length > 300 ? "text-red-600" : ""
            }`}
          >
            {post.description.length}/300
          </p>
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-600 text-white font-md p-2 my-2 rounded-lg text-sm"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
