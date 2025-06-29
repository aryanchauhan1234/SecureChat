import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Message send failed!");
    }
  };

  return (
    <div className="w-full p-4 border-t border-base-300 bg-base-100">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-3">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-base-300 shadow-sm"
            />
            <button
              onClick={removeImage}
              type="button"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 text-error flex items-center justify-center shadow hover:bg-red-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input input-sm sm:input-md input-bordered w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`hidden sm:flex btn btn-circle btn-sm transition-colors 
              ${imagePreview ? "bg-emerald-100 text-emerald-600" : "text-base-content/40 hover:text-primary"}`}
            title="Attach Image"
          >
            <Image size={18} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className={`relative top-0.5 p-2 rounded-full transition-all
            ${!text.trim() && !imagePreview
              ? "cursor-not-allowed opacity-40 bg-gray-300"
              : "bg-gradient-to-tr from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md active:scale-95"
            }`}
          title="Send"
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
