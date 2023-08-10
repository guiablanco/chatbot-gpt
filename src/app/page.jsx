'use client'
import { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = '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';

const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}



export default function Home() {

  //message state config
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm GuiaGPT-3.5!! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);

  //Typing state
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    //Initial system message to determinate ChatGPT functionality
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  }

  async function processMessageToChatGPT(chatMessages){
    /*
    messages is an array of mesages
    Format messages for chatGPT API
    API is expecting objects in format of
    { role: "user" or "assistant", "content": "message here"}
    Need reformat
    */

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT"){
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        return data.json();
      }).then((data) => {
        console.log(data);
        setMessages([...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]);
        setIsTyping(false);
      });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">

        <div style={{ position:"relative", height: "800px", width: "700px"}}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior='smooth'
                typingIndicator={isTyping ? <TypingIndicator content="GuiaGPT is typing" /> : null }
              >
                {messages.map((message, i) => {
                  console.log(message)
                  return <Message key={i} model={message} />
                })}
              </MessageList>
              <MessageInput placeholder='Type message here' onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>

      </div>
    </main>
  )
}
