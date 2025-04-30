import { useState } from "react";

const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

function ShareButton({ build }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${FRONTEND_URL}/builds/${build.id}`;

  const handleShare = async () => {
    try {
      // Always copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // If Web Share API is supported, also open native share dialog
      if (navigator.share) {
        try {
          await navigator.share({
            title: build.name,
            text: `Check out this build: ${build.name}`,
            url: shareUrl,
          });
        } catch (err) {
          console.warn("Share cancelled or failed", err);
        }
      }
    } catch (error) {
      console.error("Sharing or copying failed:", error);
      alert("Unable to share or copy the link.");
    }
  };

  return (
    <button className="btn btn-outline-primary" onClick={handleShare}>
      <i className="bi bi-share-fill"></i>{" "}
      {copied ? "Link Copied!" : "Share Build"}
    </button>
  );
}

export default ShareButton;
