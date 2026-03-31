import EmojiPicker from "emoji-picker-react";
import { Image, Send, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { sendMessage } from "../store/slices/chatSlice";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const dispatch = useDispatch();

  // ✅ Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Append emoji to text
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);
    const type = file.type;

    if (type.startsWith("image/")) {
      setMediaType("image");
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (type.startsWith("video/")) {
      setMediaType("video");
      const videoUrl = URL.createObjectURL(file);
      setMediaPreview(videoUrl);
    } else {
      toast.error("Please select image or video file.");
      setMedia(null);
      setMediaPreview(null);
      setMediaType("");
      return;
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    const data = new FormData();
    data.append("text", text.trim());
    data.append("media", media);

    dispatch(sendMessage(data));

    // Reset All
    setText("");
    setMedia(null);
    setMediaPreview(null);
    setMediaType("");
    setShowEmojiPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="px-2 py-3 sm:px-4 w-full">
      {/* Media Preview */}
      {mediaPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {mediaType === "image" ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-700"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="w-32 h-20 object-cover rounded-lg border border-gray-700"
              />
            )}
            <button
              onClick={removeMedia}
              type="button"
              className="absolute top-2 right-2 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-black"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker — anchored above input */}
      <div className="relative" ref={emojiPickerRef}>
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-50 shadow-lg rounded-lg">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              skinTonesDisabled
              searchDisabled={false}
              height={380}
              width={300}
            />
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-1 sm:gap-2"
        >
          {/* Input wrapper with icons inside */}
          <div className="flex-1 min-w-0 flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full transition shrink-0
                ${showEmojiPicker ? "text-yellow-400" : "text-gray-400"} hover:text-yellow-400`}
            >
              <Smile size={16} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent focus:outline-none text-sm sm:text-base min-w-0"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleMediaChange}
            />

            {/* Media Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full transition shrink-0
                ${mediaPreview ? "text-emerald-500" : "text-gray-400"} hover:text-emerald-400`}
            >
              <Image size={16} />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 shrink-0"
            disabled={!text.trim() && !media}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
