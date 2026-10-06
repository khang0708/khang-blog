// Lets any component open the chatbot, e.g. the Contact section's "chat with the assistant" button.
// "lead" opens the chat with the contact form already in front of the visitor (a scripted greeting, so no AI call is spent).
export type OpenChat = { mode?: "lead" };

export const openChat = (detail: OpenChat = {}) => window.dispatchEvent(new CustomEvent<OpenChat>("open-chat", { detail }));
export const OPEN_CHAT = "open-chat";
