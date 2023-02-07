import Message from "@/components/Message";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "utils/firebase";
import { toast } from "react-toastify";
import {
  arrayUnion,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { BsTrash2Fill } from "react-icons/bs";

export default function Details() {
  const router = useRouter();
  const routeData = router.query;
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  //Submit a message
  const submitMessage = async () => {
    //Check if user is logged
    if (!auth.currentUser) return router.push("/auth/login");

    if (!message) {
      toast.error("Don't leave an empty message 😒", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        toastId: "emptyComment",
      });
      return;
    }

    const docRef = doc(db, "posts", routeData.id);
    await updateDoc(docRef, {
      comments: arrayUnion({
        message,
        avatar: auth.currentUser.photoURL,
        userName: auth.currentUser.displayName,
        time: Timestamp.now(),
        user: auth.currentUser.uid,
        id: auth.currentUser.uid + routeData.id + Number(Timestamp.now()),
      }),
    });
    setMessage("");
  };

  //Get Comments
  const getComments = async () => {
    const docRef = doc(db, "posts", routeData.id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      console.log(snapshot.data);
      setAllMessages(snapshot.data().comments);
    });
    return unsubscribe;
  };

  useEffect(() => {
    if (!router.isReady) return;
    //console.log("Run this function");
    getComments();
  }, [router.isReady]);

  //Remove comments
  const deleteComment = async (index) => {
    let updateMessages = [...allMessages];
    updateMessages.splice(index, 1);

    const docRef = doc(db, "posts", routeData.id);
    await updateDoc(docRef, {
      comments: [...updateMessages],
    });
  };

  return (
    <div>
      <Message {...routeData}></Message>
      <div className="my-4">
        <div className="flex">
          <input
            onChange={(event) => setMessage(event.target.value)}
            type="text"
            value={message}
            placeholder="Send a message 😄"
            className="bg-gray-800 w-full p-2 text-white text-sm"
          />
          <button
            onClick={submitMessage}
            className="bg-cyan-500 text-white py-2 px-4 text-sm"
          >
            Submit
          </button>
        </div>
        <div className="py-6">
          <h2 className="font-bold">Comments</h2>
          {allMessages?.map((message, index) => (
            <div className="bg-white p-4 my-4 border-2" key={message.id}>
              <div className="flex items-center gap-2 mb-4 text-sm">
                <img className="w-10 rounded-full" src={message.avatar} />
                <h3>{message.userName}</h3>
              </div>
              <p>{message.message}</p>
              {message.user === auth.currentUser.uid ? (
                <button
                  onClick={() => deleteComment(index)}
                  className="text-pink-600 flex items-center justify-center gap-2 py-2 text-sm"
                >
                  <BsTrash2Fill />
                  Delete
                </button>
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
