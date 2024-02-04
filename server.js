
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mysql2 = require('mysql2/promise'); 
const axios=require('axios')
var util = require('util');
const { createPool } = require('mysql');
const secretKey = 'keyboard_cat';
const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const serviceAccount = require('./hiyab-afa75-firebase-adminsdk-u1d5s-4da9075c0b.json');
 admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hiyab-afa75-default-rtdb.firebaseio.com"
  });

const corsOptions = {
  origin: ['https://websocket.banolive.com/'],
  methods: ['GET', 'POST'],
  credentials: true,
};


app.use((req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": "*", // Set the specific origin
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
        "Access-Control-Allow-Credentials": "true", // Allow credentials
    });

    next();
});
app.get('/', (request, response) => {
  axios
    .get('https://fakestoreapi.com/products')
    .then(function (axiosResponse) {
      // Send the data from the Axios response once
      response.send(axiosResponse.data);
    })
    .catch(function (error) {
      // Handle error and send an error response
      response.status(500).send(error.message);
    })
    .finally(function () {
      // This will not be reached because response has already been sent
      // response.send("process end");
    });
});
const pool = createPool({
  host: 'localhost',
  user:'tecxoul_socket_io_user',
  database:'tecxoul_hiyab',
  password:'jlb+]&VlI6d)',
    
  
  });
  const pool2 = mysql2.createPool({

    host: 'localhost',
    user:'tecxoul_socket_io_user',
    database:'tecxoul_hiyab',
    password:'jlb+]&VlI6d)',
  

});
pool2.query = util.promisify(pool2.query);
const io = socketIO(server, {
  cors: corsOptions,
});

app.use(cors());
// china game



app.get('/game/getUserInfo',(req,res)=>{
    try {
 
  
  const user_data="select * from users";
    pool.query(user_data, (error, results, fields) => {
    if (error) {
             res.json({error:"true",code:1 ,data: null });

    } else {
     const user = results[0]; // Assuming results[0] contains the user data

        const response = {
          error: false,
          code: 0,
          data: user,
          message: 'success',
        };
        
        res.json(response);
            }
    });

} catch (error) {
  console.error(error);
  res.status(202).json({ error: error.message });
}
    
})









// checok connection
app.get('/check-socket', (req, res) => {
  try {
    if (io.engine.clientsCount >= 0) {
      res.status(200).json({ status: 'Socket.IO is working' });
    } else {
      res.status(500).json({ error: 'Socket.IO is not working' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Socket.IO is not working'.error });
  }
});
// --------------------------------------  new
// ---------------

let count=0;
let total=0;
io.on('connection', (socket) => {
    console.log('Connected:',total++)
  const userId = socket.handshake.query.userId;
  var socket_id=socket.id;

  if(userId && socket_id){
    const updateSocket_id = `UPDATE users SET socket_id = ? , status=1  WHERE id = ?;`;
    pool.query(updateSocket_id, [socket_id, userId], (UpdateSocketerror, UpdateSocketresults) => {
      if (UpdateSocketerror){
  
      }
      else{

            socket.emit('activeStatus',{ id: userId, is_active: true })
        socket.emit('generateChatId','ID generated.')
       var UpdateMessagesStatus="UPDATE  messages SET  status=2 where reciver_id=? ";
        pool.query(UpdateMessagesStatus, [userId], (UpdateMessagesStatusError, UpdateMessagesStatusresults, UpdateMessagesStatusFields) => {
            
           
      
      
      
          })
      }
    });
  
  }
 socket.on('Welcome', () => {
    console.log('Welcome event received:', );
    socket.emit('hello user', 'Hello user!');
  });



socket.on('joinRoom', (data) => {
  const threadId = data.threadId;
  const threadIdArray = threadId.split('-');
const firstValue = threadIdArray[0];
const secondValue = threadIdArray[1];
  const reversedThread = `${secondValue}-${firstValue}`;

  if(!threadId){
    io.emit('joinRoomError',`Thread Id  is empty.`)
      return;
  }
  const user_id = data.senderId;
  const reciver_id = data.recieverId;
  const thread_id = threadId;
  const un_read_count = 0;
  const is_in_chat = false; // Use boolean values instead of string "false"
  const is_muted = false;
  const is_deleted = false;
  const group_id = 0; // Not using

 
  const users_sender_record="SELECT * from users where id=?";
  const checkThread = "SELECT * FROM participants WHERE thread_id = ? OR thread_id = ? ";
  const participent_save_sender = "INSERT into participants(user_id, thread_id, profile_pic,un_read_count, is_in_chat, is_muted, is_deleted) Values (?, ?, ?,?, ?, ?, ?)";
  const participent_save_reciver = "INSERT into participants(user_id, thread_id, profile_pic,un_read_count, is_in_chat, is_muted, is_deleted) Values (?, ?, ?,?, ?, ?, ?)";
  const participent_thread_get="Select * from participants where thread_id=?";
  const saved_reciver_participent="SELECT * FROM participants WHERE user_id = ? AND thread_id = ?";
  const saved_sender_participent="SELECT * FROM participants WHERE user_id = ? AND thread_id = ?";
  const create_new_thread="INSERT INTO threads(thread_id,avatar,is_group) VALUES(?,NULL,0)";
  const thread_save_get="SELECT * FROM threads where thread_id=?";
  const sender_profile_pic="SELECT profile_pic FROM user_media where user_id=?";
  const reciever_profile_pic="SELECT profile_pic FROM user_media where user_id=?";
   // IS IN CHAT
    var leave_room="UPDATE  participants SET  is_in_chat=1,un_read_count = 0 where user_id=? AND thread_id=? ";
 pool.query(leave_room, [user_id,thread_id], (leave_roomError, leave_roomresults, leave_roomFields) => {
                   if(leave_roomError){
                    }
 var UpdateMessagesStatus="UPDATE  messages SET  status=3 where thread_id=? AND reciver_id=? ";
         pool.query(UpdateMessagesStatus, [thread_id,reciver_id], (UpdateMessagesStatusError, UpdateMessagesStatusresults, UpdateMessagesStatusFields) => {
                    if(UpdateMessagesStatusError){
                }
                                                  
                                                  
                                                  
                  
                                                  
  pool.query(checkThread, [threadId,reversedThread], (error, results, fields) => {
    if (error) {
      console.error('Error:', error);
      socket.emit('joinRoomError',`Check thread error  ${error}`)
    } else {
      if (results.length > 0) {
        socket.join(threadId);
        socket.emit('joinRoom', `Room joined successfully`);



      } else {
        // First-time insertion
          pool.query(sender_profile_pic, [user_id], (sender_profile_picError, sender_profile_picResults, sender_profile_picFields) => {
          if(sender_profile_picError){
            socket.emit('joinRoomError',`Sender Profile Picture  ${error}`)
            return ;
          }else{
            var profile_sender_image = (sender_profile_picResults[0] && sender_profile_picResults[0].profile_pic) ? sender_profile_picResults[0].profile_pic : null;  
            pool.query(reciever_profile_pic, [reciver_id], (reciever_profile_picError, reciever_profile_picResults, reciever_profile_picFields) => {
              if(reciever_profile_picError){
                socket.emit('joinRoomError',`Reciever Profile Picture  ${error}`)
                return ;
              }else{
                var profile_reciever_image = (reciever_profile_picResults[0] && reciever_profile_picResults[0].profile_pic) ? reciever_profile_picResults[0].profile_pic : null;  
              
                pool.query(participent_save_sender, [user_id, thread_id, profile_sender_image,un_read_count, is_in_chat, is_muted, is_deleted], (error, results, fields) => {
                  if (error) {
                    console.error('Error:', error);
                    socket.emit('joinRoomError',`first TimeChat  error  ${error}`)
                  } else {
                    // --------------------------- SENDER INSERT PARTICIPENT
                    pool.query(participent_thread_get, [thread_id], (insertedRecordResponseError, insertedRecordResponseResults, insertedRecordResponseFields) => {
                      if (insertedRecordResponseError) {
                          console.error('Error:', insertedRecordResponseError);
                          socket.emit('joinRoomError',`inserted Record Error  ${insertedRecordResponseError}`)
        
                      } else {
                        var participants_record = insertedRecordResponseResults[0];
                        //-------------------------------   SAVE NEW  RECIVER PARTICIPENT  a new entry -------
                        pool.query(participent_save_reciver, [reciver_id, thread_id, profile_reciever_image,un_read_count, is_in_chat, is_muted, is_deleted], (firstTimeChat_recieverError, firstTimeChat_recieverResults, firstTimeChat_recieverFields) => {
                            if(firstTimeChat_recieverError){
                              console.error('Error:', firstTimeChat_recieverError);
        

                            }
                            else{
        
                            // ---------------------------  SENDER  SELECT RECORD   USER  table  for socket id get and send emit---------
                              pool.query(users_sender_record, [user_id], (select_sender_idError, select_sender_idresults, select_sender_idFields) => {
                                  if (select_sender_idError) {
                                      console.log(select_sender_idError);
                                      socket.emit('joinRoomError',`select sender_id  Error  ${select_sender_idError}`)
                                  } else {
                                      var sender_id_data = select_sender_idresults[0];
                                      var sender_socket_id=select_sender_idresults[0].socket_id;
                                      if(!sender_socket_id){
                                        socket.emit('joinRoomError',`Undefined sender socket id`)

                                        return 
                                      }
                                    // ----------------------- RECIEVER ID SELECT USER_ TABLE  for socket id--------
                                      pool.query(users_sender_record, [reciver_id], (select_reciever_idError, select_reciever_idresults, select_reciever_idFields) => {
                                          if (select_reciever_idError) {
                                            socket.emit('joinRoomError',`select reciever id Error  ${select_reciever_idError}`)
            
                                          } else {
                                              var reciever_id_data = select_reciever_idresults[0];
                                              var reciever_socket_id=select_reciever_idresults[0].socket_id;
                                              
                                             // ---------------------inserted PARTICIPENT Sender RECORD  get back to emit ----
                                             pool.query(saved_sender_participent, [user_id,thread_id], (sender_participentError, sender_participentResults, sender_participentFields) => {
                                              if (sender_participentError) {
                                                  console.error('Error:', sender_participentError);
                                                  socket.emit('joinRoomError',`inserted Record Error  ${sender_participentError}`)
                                
                                              }else{
                                                var sender_data_participent = sender_participentResults[0];
                                                //------------------ GET INSERTED RECIVER PARTICIPENT DATA ENTRY RESULT BACK TO EMIT 
                                                pool.query(saved_reciver_participent, [reciver_id,thread_id], (reciver_participentError, reciver_participentResults, reciver_participentFields) => {
                                                  if (reciver_participentError) {
                                                      console.error('Error:', reciver_participentError);
                                                      socket.emit('joinRoomError',`inserted Record Error  ${reciver_participentError}`)
                                    
                                                  }
                                                  else{
                                                    var reciever_data_participent = reciver_participentResults[0];
                                                  
                                                    //---------------------- create A new thread of chat new ---------------------
                                                    pool.query(create_new_thread, [threadId], (thread_save_tableError, thread_save_tableResults, thread_save_tableFields) => {
                                                    if(thread_save_tableError){
                                                      socket.emit('joinRoomError',`inserted Record Error  ${thread_save_tableError}`)
        
                                                    }
                                                    else{
                                                        //-------------------------- create new thread table -------------------
                                                      pool.query(thread_save_get, [threadId], (thread_save_getError, thread_save_getResults, thread_save_getFields) => {
                                                          if(thread_save_getError){
                                                            socket.emit('joinRoomError',`inserted Record Error  ${thread_save_getError}`)
        
                                                          }
                                                          else{
                                                            const thread_save_data=thread_save_getResults[0];
                                                    

                                                        //  -----------------------   END CODE RESPONSES 
                                                        var response = {
                                                          ...thread_save_data,
                                                          messages: [],
                                                          participants: [
                                                              {
                                                                  ...sender_data_participent,
                                                                  user: sender_id_data
                                                              },
                                                              {
                                                                ... reciever_data_participent,
                                                                  user: reciever_id_data
                                                              }
                                                          ]
                                                      };
                                                      
                                                    
                                                        socket.join(threadId);
                                                        socket.to(reciever_socket_id).emit('conversation', response);
                                                        io.to(sender_socket_id).emit('conversation', response);
                                                        socket.emit('joinRoom', `Room joined successfully`);

                          
                                                
                                                          }
        
                                                      })
        
        
        
                                                    }
                                                 
                                                    
                                                    
                                                  
                                                  })
                                               } })
                                          
                                              }
                                            });
                                  
                                          }
                                      });
                                  }
                              });
        
                              
                            }
        
                       
                        })
                         
                      }
                  });
                  
                  
                    
                    }
                    
                });

              
              
              }
            })


          }

        })

      
      }
    }
  });
          })                          
                                                
                  })

  // Notify the other user to join the same room
});






//////////////////////////////////////////////////////////    SEND WITH UNREAD          ////////////////////////////////////////


// ------------------------------------------------- LEAVE ROOM
  socket.on('leaveRoom',(data)=>{
   var leave_room="UPDATE  participants SET is_in_chat=0,un_read_count=0 where user_id=? AND thread_id=? ";
   var userId= data.senderId;
   var thread_id=data.threadId;
   if(!userId || !thread_id){
    socket.emit('leaveRoom','Invalid parameters! user id or thread id missing')

   }
   pool.query(leave_room, [userId,thread_id], (leave_roomError, leave_roomresults, leave_roomFields) => {
    if(leave_roomError){
      socket.emit('leaveRoom',`Leave room error: ${leave_roomError}`)
    }

      socket.emit('leaveRoom','Room leaved successfully')


   })


  })







///////////////////////////////////   Live code   =================== /////////////////////////////////
socket.on('sendMessage', (data) => {
        

  const senderId = data.senderId;
  const recieverId = data.recieverId;
  const thread_id = data.threadId;
  const type = data.type;
  const message_at=data.messageAt;
  const reply = (data.reply !== null) ? data.reply : null;
  const message = (type === 'text') ? data.message : null;
  const image = (type === 'image') ? data.message : null;
  const video = (type === 'video') ? data.message : null;
  const audio = (type === 'audio') ? data.message : null;
  const file = (type === 'file') ? data.message : null;
  const location = (type === 'location') ? data.message : null;
  var status=1;

  const message_save_query = "INSERT INTO messages (thread_id, sender_id, reply, is_forward, status, message, sent, reciver_id,type,image,video,audio,file,location,message_at) VALUES (?, ?, ?, NULL, ?, ?, 1, ?,?,?,?,?,?,?,?)";
  const check_last_message = "SELECT id FROM last_message WHERE  thread_id = ?";
  const insert_last_message="INSERT INTO last_message (thread_id, sender_id, reply, is_forward, status, message, sent, reciver_id,type,image,video,audio,file,location,message_at) VALUES (?, ?, ?, NULL, ?, ?, 1, ?,?,?,?,?,?,?,?)";
  const update_last_message = ` UPDATE last_message  SET message_id=?, thread_id = ?, sender_id = ?,  reply = ?, is_forward = NULL,  status = ?, message = ?, sent = 1,reciver_id = ?, type = ?, image = ?, video = ?,audio = ?,file = ?,location = ?, message_at = ? 
  WHERE 
     sender_id = ? 
     AND reciver_id = ? 
     AND thread_id = ?
`;
const sender_users_record = "SELECT socket_id,name FROM users WHERE id = ?";
const reciever_users_record = "SELECT socket_id,name,fcm_token FROM users WHERE id = ?";
const reciver_participent="SELECT * FROM participants WHERE user_id = ? AND thread_id = ?";
const get_inserted_message_query = "SELECT * FROM messages WHERE sender_id = ? AND reciver_id = ? AND thread_id = ? ORDER BY id DESC LIMIT 1";
const message_status_update="UPDATE messages SET status=? where reciver_id=? AND thread_id=? AND id=?"
const final_sender_participent="SELECT * FROM participants WHERE user_id = ? AND thread_id = ?";
const final_reciver_participent="SELECT * FROM participants WHERE user_id = ? AND thread_id = ?";
const thread_save_get="SELECT * FROM threads where thread_id=?";
const update_unread_count = "UPDATE participants SET un_read_count = un_read_count + 1 WHERE thread_id = ? AND user_id = ? ";
const updated_message_get="Select * from messages where id=?";

pool.query(sender_users_record, [senderId], (sender_users_recorderror, sender_users_recordresults) => {
  if (sender_users_recorderror) {
    socket.emit('sendMessage', `sender Id error:${sender_users_recorderror}`);
  }    
  const db_socket_sender_id = sender_users_recordresults[0]?.socket_id || null;
  const sender_id_data = sender_users_recordresults[0] ;
  var sender_name=sender_users_recordresults[0].name;
  pool.query(reciever_users_record, [recieverId], (reciever_users_recorderror, reciever_users_recordresults) => {
    if (reciever_users_recorderror) {
      socket.emit('sendMessage', `sender Id error:${reciever_users_recorderror}`);
    } else {
      const db_socket_reciver_id = reciever_users_recordresults[0]?.socket_id || null;
      const reciever_id_data = reciever_users_recordresults[0];
      const reciever_fcm_token = reciever_users_recordresults[0].fcm_token || null;


  pool.query(message_save_query,
    [
      thread_id, senderId, reply,status, message, recieverId, type, image, video, audio, file, location ,message_at
    ],
    (message_saveError, message_saveResults, message_saveFields) => {
      if (message_saveError) {
        socket.emit('sendMessage', `message save Error:${message_saveError}`);
      } 
      else {
        //////////////////////// check last message if alread available then update else create
        pool.query(check_last_message, [ thread_id], (check_last_Error, check_last_Results, check_last_Fields) => {
          if(check_last_Error){
            socket.emit('sendMessage', `Check las message:${check_last_Error}`);
          }
          var is_message = check_last_Results && check_last_Results.length > 0 ? check_last_Results[0] : null;
           ///////// ------------------ insert LAST MESSAGE if not found ------------- //////////
            if(is_message==null){
              pool.query(insert_last_message,
                [
                  thread_id, senderId, reply,2, message, recieverId, type, image, video, audio, file, location ,message_at
                ]
                ,(last_messageError, last_messageResults, last_messageFields) => {
                  if(last_messageError){
                    socket.emit('sendMessage', `Last message Insert error:${last_messageError}`);
                  }
                  else{
                    pool.query(get_inserted_message_query, [senderId, recieverId, thread_id], (fetchError, fetchResults, fetchFields) => {
                      if (fetchError) {
                        console.error('Error fetching inserted message:', fetchError);
                        socket.emit('sendMessageError', `Error fetching inserted message:${fetchError}`);
                      } else {
                        const insertedMessage = fetchResults[0];
                        const insertedMessage_id = fetchResults[0].id;
                    socket.to(db_socket_reciver_id).emit('newMessage', insertedMessage);
                    io.to(db_socket_sender_id).emit('newMessage', insertedMessage);
                      }
                    })
                  }
                })
            }
            // ----------------------- get reciver REcords  ------------------------////////
            else{

                            
                pool.query(reciver_participent, [recieverId,thread_id], (reciver_participentError, reciver_participentResults, reciver_participentFields) => {
                  if (reciver_participentError) {
                  socket.emit('sendMessage',`reciver participent Record Error  ${reciver_participentError}`)
                      
                      }else{
                        const is_in_chat_reciever = reciver_participentResults[0]?.is_in_chat || null;
                        const reciever_data_participent = reciver_participentResults[0];

                        pool.query(get_inserted_message_query, [senderId, recieverId, thread_id], (fetchError, fetchResults, fetchFields) => {
                          if (fetchError) {
                            console.error('Error fetching inserted message:', fetchError);
                            socket.emit('sendMessageError', `Error fetching inserted message:${fetchError}`);
                          } else {
                            const insertedMessage = fetchResults[0];
                            const insertedMessage_id = fetchResults[0].id;
                            
                    if(is_in_chat_reciever==1 &&  db_socket_reciver_id){
                      io.to(db_socket_sender_id).emit('status', "condition 1");


                      pool.query(message_status_update, [3,recieverId,thread_id,insertedMessage_id], (message_status_updateError, message_status_updateResults, message_status_updateFields) => {
                        if (message_status_updateError) {
                        socket.emit('sendMessage',`reciver participent Record Error  ${message_status_updateError}`)
                            
                            }
                            else{                             
                              // Usage:
                              updateMessageInDatabase(pool, socket, io, insertedMessage_id, thread_id, senderId, reply, 3, message, recieverId, type, image, video, audio, file, location, message_at);
                              

                  
                            }
                          }
                          )
                    }
                   else if(is_in_chat_reciever==0  &&  db_socket_reciver_id ){
                    
                      io.to(db_socket_sender_id).emit('status', "condition 2");

                      console.log('not in chat')

                
                       pool.query(update_unread_count, [thread_id,senderId], (update_unread_countError, update_unread_countresults, update_unread_countFields) => {
                        pool.query(message_status_update, [2,recieverId,thread_id,insertedMessage_id], (message_status_updateError, message_status_updateResults, message_status_updateFields) => {
                        if (message_status_updateError) {
                          console.log(message_status_updateError)
                        socket.emit('sendMessage',`reciver participent Record Error  ${message_status_updateError}`)
                            
                            }
                            else{
                               
                              updateMessageInDatabase(pool, socket, io, insertedMessage_id, thread_id, senderId, reply, 2, message, recieverId, type, image, video, audio, file, location, message_at);


                  
                            }
                          }
                          )
                        })



                    }

                  else{

                 

                      pool.query(update_unread_count, [thread_id,senderId], (update_unread_countError, update_unread_countresults, update_unread_countFields) => {
                        pool.query(message_status_update, [1,recieverId,thread_id,insertedMessage_id], (message_status_updateError, message_status_updateResults, message_status_updateFields) => {
                        if (message_status_updateError) {
                          console.log(message_status_updateError)
                        socket.emit('sendMessage',`reciver participent Record Error  ${message_status_updateError}`)
                            
                            }
                            else{


                              const message = {
                                data: {
                                  key1: 'Firebase notification send ',
                                  key2: 'Send message'
                                },
                                notification: {
                                  title: sender_name,
                                  body:  type === 'text' ? data.message : 'New Message'
                                },
                                token: reciever_fcm_token
                              };
                              
                              admin.messaging().send(message)
              .then((response) => {
                console.log('Successfully sent message:', response,"message:",message);
              })
              .catch((error) => {
                console.error('Error sending message:', error);
              });
                                      
                               updateMessageInDatabase(pool, socket, io, insertedMessage_id, thread_id, senderId, reply, 1, message, recieverId, type, image, video, audio, file, location, message_at);

                            


                  
                            }
                          }
                          )
                        })



                    }

                     
                    function updateMessageInDatabase(pool, socket, io, insertedMessage_id, thread_id, senderId, reply, status, message, recieverId, type, image, video, audio, file, location, message_at) {
                      pool.query(update_last_message, [
                        insertedMessage_id, thread_id, senderId, reply, status, message, recieverId, type, image, video, audio, file, location, message_at, senderId, recieverId, thread_id
                      ], (update_Error, update_Results, update_Fields) => {
                       
                    
                        pool.query(final_sender_participent, [senderId, thread_id], (final_sender_participentError, final_sender_participentResults, final_sender_participentFields) => {
                           pool.query(updated_message_get, [
                          insertedMessage_id
                        ], (updated_message_Error, updated_message_get_Results, updated_message_get_Fields) => {
                       const updated_insert_message=updated_message_get_Results[0];

                    
                          var sender_data_participent = final_sender_participentResults[0];
                    
                          pool.query(final_reciver_participent, [recieverId, thread_id], (final_reciver_participentError, final_reciver_participentResults, final_reciver_participentFields) => {
                          
                    
                            const reciever_data_participent = final_reciver_participentResults[0];
                    
                            pool.query(thread_save_get, [thread_id], (thread_save_getError, thread_save_getResults, thread_save_getFields) => {
                              if (thread_save_getError) {
                                console.log(thread_save_getError);
                                return;
                              } else {
                                const thread_save_data = thread_save_getResults[0];
                                var response = {
                                  ...thread_save_data,
                                  messages: [],
                                  participants: [{
                                      ...sender_data_participent,
                                      user: sender_id_data
                                    },
                                    {
                                      ...reciever_data_participent,
                                      user: reciever_id_data
                                    }
                                  ]
                                };
                    
                              
                    
                                // if (type !== "text") {
                                //   notifications = {
                                //     sender_name,
                                //     type: capitalizeFirstLetter(type)
                                //   };
                                // }
                    
                                console.log("db_socket_reciver_id", db_socket_reciver_id);
                                // socket.to(db_socket_reciver_id).emit('notification', notifications);
                                socket.to(db_socket_reciver_id).emit('conversation', response);
                                socket.to(db_socket_reciver_id).emit('newMessage', updated_insert_message);
                                io.to(db_socket_sender_id).emit('newMessage', updated_insert_message);
                              }
                            });
                          });
                        });
                      });
                      });
                    }


                      }
                    })
                  }
                })

       

            

            }
          }
            )
       


      }
    })
  } 
})
  })




})




/////////////////////////////////// = ====================     ///////////////////////////////


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}



////////////////////////////////// -------------- unread send message  -------------///////////




// --------------- TEST UPDATE


//----------------------------------

socket.on('disconnect', () => {
  var disconnected_user = socket.id;
       
//   -------------------------Set is in chat ------------
const get_user = `SELECT id from users Where socket_id = ?`;
     pool.query(get_user, [disconnected_user], (get_useEerror, get_userResults,get_userFields) => {
        if(get_useEerror){
            
        }
        else{

          var get_user_id = get_userResults.length > 0 ? get_userResults[0] : null;   
      socket.broadcast.emit('activeStatus', { userId: get_user_id.id, active: false });

          var leave_room="UPDATE  participants SET is_in_chat=0 where user_id=? ";
         
          pool.query(leave_room, [get_user_id.id], (leave_roomError, leave_roomresults, leave_roomFields) => {
          })         
        }

       })
  
//   -------------------- clear disconnection -----------
  if (disconnected_user) {
      const updateSocket_id = `UPDATE users SET socket_id = NULL , status=0 WHERE socket_id = ?;`;
      pool.query(updateSocket_id, [disconnected_user], (UpdateSocketerror, UpdateSocketresults) => {
        if (UpdateSocketerror) {
          io.emit('offlineUser', 'Something went wrong.')

        }
        else {
          io.emit('offlineUser', 'User is offline');
          count--;

        }
      });

    }
  
  
  
});
//-----------------------------------
});






const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




