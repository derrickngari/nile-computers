import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { logger } from "./logger.js";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_URL = process.env.WHATSAPP_API_URL;
const SUPPORT_NUMBER = process.env.SUPPORT_NUMBER;
const GRAPH_VERSION  = process.env.GRAPH_VERSION ;

const getExtensionFromMime = (mime = "") => {
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  };

  return map[mime] || "";
};

const markAsRead = async (messageId) => {
  await axios({
    url: `${WHATSAPP_URL}/messages`,
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
      typing_indicator: {
        type: "text",
      },
    }),
  });

  //   {
  //   "messaging_product": "whatsapp",
  //   "status": "read",
  //   "message_id": "<WHATSAPP_MESSAGE_ID>",
  //   "typing_indicator": {
  //     "type": "text"
  //   }
  // }
};

const replyMessage = async (to, id, body) => {
  try {
    console.log("Sending reply to: ", to);
    await markAsRead(id);
    const res = await axios({
      url: `${WHATSAPP_URL}/messages`,
      method: "post",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        messaging_product: "whatsapp",
        to: `+${to}`,
        type: "text",
        text: { body },
        context: { message_id: id },
      }),
    });
    return res.data?.messages[0]?.id;
  } catch (error) {
    console.log("WhatsApp reply error details:", JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

const sendTemplate = async (to, tempName, components) => {
  try {
    const res = await axios({
    url: `${WHATSAPP_URL}/messages`,
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: tempName,
        language: {
          code: "en",
        },
        components,
      },
    }),
  });

  console.log(JSON.stringify(res.data, null, 2));

  return res.data.messages[0].id;
  } catch (error) {
    logger.error(`Error sending template: ${error.response?.data || error.message}`);
    throw error;
  }
};

const sendMessage = async (to, body, messageId) => {
  try {
    messageId && (await markAsRead(messageId));
    const res = await axios({
      url: `${WHATSAPP_URL}/messages`,
      method: "post",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        messaging_product: "whatsapp",
        to: `+${to}`,
        type: "text",
        text: { body },
      }),
    });
    return res?.data?.messages[0]?.id;
  } catch (error) {
    logger.error(
      `WhatsApp API Error: ${JSON.stringify(error.response?.data, null, 2)}`
    );
    throw error;
  }
};

const uploadMedia = async (filePath, mimeType) => {
  try {
    const data = new FormData();
    data.append("messaging_product", "whatsapp");

    // const filePath = path.join( process.cwd(), "uploads", "1757166641543-19873122.jpeg");
    // const filePath = "C:/Users/Dee/Pictures/Screenshots/Screenshot 2025-09-03 182013.png";
    data.append("file", fs.createReadStream(filePath));
    data.append("type", mimeType);

    const res = await axios({
      method: "post",
      url: `${WHATSAPP_URL}/media`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      data,
    });

    return res.data?.id;
  } catch (error) {
    logger.error("Error uploading asset: ", error.message);
  }
};

const deleteMedia = async (mediaId) => {
  try {
    const res = await axios({
      method: "delete",
      url: `${WHATSAPP_URL}/${mediaId}`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    });
    console.log("Delete Response: ", res.data);
    return res.data?.success;
  } catch (error) {
    logger.error(`Error deleting whatsapp media: ${error}`);
  }
};

const sendList = async (
  to,
  messageId,
  bodyText,
  sections,
  footerText = "Skylink Networks — 24/7 Support",
  buttonTitle = "Tap to View Menu"
) => {
  try {
    await markAsRead(messageId);
    const res = await axios({
      url: `${WHATSAPP_URL}/messages`,
      method: "post",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `+${to}`,
        type: "interactive",
        interactive: {
          type: "list",
          body: {
            text: bodyText,
          },
          footer: {
            text: footerText,
          },
          action: {
            button: buttonTitle,
            sections,
          },
        },
        context: messageId ? { message_id: messageId } : undefined,
      },
    });

    console.log(`List menu sent to ${to}`);

    return res.data.messages[0].id;
  } catch (error) {
    console.log("Error sending list:", error.response?.data || error.message);
    logger.error("Error sending list: ", error.message);
  }
};

const sendImage = async (to, messageId, mediaId, caption = "") => {
  try {
    messageId && (await markAsRead(messageId));
    const res = await axios({
      method: "post",
      url: `${WHATSAPP_URL}/messages`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `+${to}`,
        type: "image",
        image: {
          id: mediaId,
          caption,
        },
        context: messageId ? { message_id: messageId } : undefined,
      },
    });
    console.log(`Image File sent to ${to}`);
    return res?.data?.messages[0].id;
  } catch (error) {
    console.log("Error sending image:", error.response?.data || error.message);
    logger.error("Error sending image: ", error.message);
  }
};

const sendVideo = async (to, messageId, mediaId, caption = "") => {
  try {
    messageId && (await markAsRead(messageId));
    const res = await axios({
      method: "post",
      url: `${WHATSAPP_URL}/messages`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `+${to}`,
        type: "video",
        video: {
          id: mediaId,
          caption,
        },
        context: messageId ? { message_id: messageId } : undefined,
      },
    });
    console.log(`Video File sent to ${to}`);
    return res?.data?.messages[0].id;
  } catch (error) {
    console.log("Error sending image:", error.response?.data || error.message);
    logger.error("Error sending image: ", error.message);
  }
};

const sendDocument = async (to, messageId, waid, filename, caption) => {
  try {
    messageId && (await markAsRead(messageId));
    const res = await axios({
      method: "post",
      url: `${WHATSAPP_URL}/messages`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `+${to}`,
        type: "document",
        document: {
          id: waid,
          filename,
          caption,
        },
        context: messageId ? { message_id: messageId } : undefined,
      },
    });
    console.log(`Document sent to ${to}`);
    return res?.data?.message[0]?.id;
  } catch (error) {
    console.log("Error sending image:", error.response?.data || error.message);
    logger.error("Error sending image: ", error.message);
  }
};

export {
  sendMessage,
  markAsRead,
  replyMessage,
  uploadMedia,
  deleteMedia,
  sendList,
  sendImage,
  sendVideo,
  sendDocument,
  sendTemplate,
};