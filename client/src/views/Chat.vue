
 <template>
 <div class="chat-container">
      <!-- 连接状态指示器 -->
      <div v-if="!isConnected" class="connection-status">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
        >
          <template #title>
            连接已断开，正在重连...
          </template>
        </el-alert>
      </div>

      <!-- 在线用户数 -->
      <div class="online-count">
        <el-badge :value="onlineUsers.length" type="success">
          <el-icon><User /></el-icon>
        </el-badge>
        <span>{{ onlineUsers.length }} 人在线</span>
      </div>

      <!-- 聊天组件 -->
      <vue-advanced-chat
        :current-user-id="userStore.user?.id.toString()"
        :rooms="JSON.stringify(chatStore.rooms)"
        :messages="JSON.stringify(chatStore.formattedMessages)"
        :messages-loaded="chatStore.messagesLoaded"
        :loading-rooms="chatStore.loadingRooms"
        :rooms-loaded="chatStore.roomsLoaded"
        :single-room="true"
        :room-id="chatStore.currentRoom.roomId"
        :show-emojis="true"           
        :show-reaction-emojis="true"  
        height="calc(100vh - 100px)"
        @fetch-messages="handleFetchMessages"
        @send-message="handleSendMessage"
        @edit-message="handleEditMessage"
        @delete-message="handleDeleteMessage"
        @typing-message="handleTyping"
        @send-message-reaction="handleSendReaction"
        @open-file="handleOpenFile"
      >
      </vue-advanced-chat>

          <!-- ✨ 使用 custom-action-icon 插槽添加 Sticker 按钮 -->
          <div class="custom-sticker-btn">
            <el-popover
              placement="top"
              :width="430"
              trigger="click"
              popper-class="giphy-popover"
            >
              <template #reference>
                <el-button
                  circle
                  :icon="Picture"
                  title="发送表情包"
                />
              </template>
              <GiphyPicker @select-gif="handleSelectGif" />
            </el-popover>
          </div>
      
    </div>
  </template>

  <script setup>
  import { Picture } from '@element-plus/icons-vue'
  import GiphyPicker from '@/components/GiphyPicker.vue'
  import axios from 'axios';
  import { ElMessage } from 'element-plus';
  import { onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { User } from '@element-plus/icons-vue';
  import { useSocket } from '@/composables/useSocket';
  import { useChatStore } from '@/stores/chat';
  import { useUserStore } from '@/stores/user';
  import { getMessages } from '@/api/chat';
  import { addReaction } from '@/api/chat';
  import { convertMessagesToChatMessages } from '@/utils/chatAdapter';
  import { watch } from 'vue';
  import { getCurrentUser } from '@/api/auth';
  import request from '@/utils/request';

  const router = useRouter();
  const chatStore = useChatStore();
  const userStore = useUserStore();

  // 使用 WebSocket Composable
  const {
    isConnected,
    onlineUsers,
    initSocket,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    editMessage,
    deleteMessage,
    disconnect
  } = useSocket();

  // 组件挂载时初始化
  onMounted(async () => {

     // 添加调试信息
    console.log('� 用户信息:', userStore.user);
    console.log('� 用户 ID:', userStore.user?.id);
    console.log('� Token:', userStore.token);

    // 检查登录状态
    if (!userStore.isLoggedIn) {
      router.push('/login');
      return;
    }

     // 如果用户信息不存在，尝试重新获取
  if (!userStore.user) {
    console.log('⚠️ 用户信息为空，尝试重新获取...');
    try {
      const userResponse = await getCurrentUser();
      if (userResponse.success) {
        userStore.setUser(userResponse.user);
        console.log('✅ 用户信息已加载:', userStore.user);
      }
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
      router.push('/login');
      return;
    }
  }

    // 初始化 WebSocket
    initSocket();

    // 加入默认房间
    setTimeout(() => {
      joinRoom('1');
    }, 500);
  });

  // 组件卸载时清理
  onUnmounted(() => {
    // 离开房间（但不断开连接）
    if (chatStore.currentRoom.roomId) {
      leaveRoom(chatStore.currentRoom.roomId);
    }
  });

  // ============================================
  // 处理 vue-advanced-chat 事件
  // ============================================
 watch(() => chatStore.messages, (newMessages) => {
    if (newMessages.length > 0) {
      const lastMsg = newMessages[newMessages.length - 1];
      console.log('� 最新消息:', lastMsg);
      console.log('� 消息的 senderId:', lastMsg.senderId, '类型:', typeof lastMsg.senderId);
      console.log('� 当前用户 ID:', userStore.user?.id, '类型:', typeof userStore.user?.id);
      console.log('� 是否相等?', lastMsg.senderId === userStore.user?.id?.toString());
    }
  }, { deep: true });
  /**
   * 加载历史消息
   */
  const handleFetchMessages = async ({ room, options } = {}) => {
    try {
      chatStore.setLoadingMessages(true);

      // 如果没有 room，使用默认房间
      const roomId = room?.roomId || chatStore.currentRoom.roomId || '1';

      if (options?.reset) {
        chatStore.clearMessages();
      }

      const response = await getMessages(roomId, {
        page: chatStore.currentPage,
        pageSize: chatStore.pageSize
      });

      if (response.success && response.messages.length > 0) {
        const chatMessages = convertMessagesToChatMessages(
          response.messages,
          userStore.user.id
        );

        chatStore.prependMessages(chatMessages);
        chatStore.currentPage++;
      } else {
        chatStore.setMessagesLoaded(true);
      }

    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      chatStore.setLoadingMessages(false);
    }
  };

   /**
   * 上传文件到服务器
   */
  const uploadFile = async (file) => {
    try {
      // 打印文件对象的完整结构
      console.log('� 上传文件对象:', file);
      console.log('� 文件对象键:', Object.keys(file));
      console.log('� file.blob:', file.blob);
      console.log('� file.file:', file.file);
      console.log('� file.name:', file.name);
      console.log('� file.type:', file.type);

      const formData = new FormData();
      // � 修复：构造完整文件名（带扩展名）
      const fullFileName = file.extension
        ? `${file.name}.${file.extension}`  // 如果有扩展名，拼接
        : file.name;
      console.log('✅ 完整文件名:', fullFileName);
       // � 创建带正确文件名的 File 对象
      const fileToUpload = new File([file.blob], fullFileName, {
        type: file.type
      });

      console.log('� 准备上传的 File 对象:', fileToUpload);

      let uploadUrl = '/upload/file';
      let fieldName = 'file';

      // 根据文件类型选择上传接口
      if (file.audio) {
        uploadUrl = '/upload/audio';
        fieldName = 'audio';
      } else if (['png', 'jpg', 'jpeg', 'gif',
  'webp'].includes(file.extension)) {
        uploadUrl = '/upload/image';
        fieldName = 'image';
      }

      // � 上传 File 对象（带文件名）而不是直接上传 Blob
      formData.append(fieldName, fileToUpload);

      // 使用 request 实例而不是 axios
      const response = await request.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ 上传响应:', response);

      if (response.success) {
        console.log('� 返回的文件 URL:', response.data.url);
        return response.data.url;
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      ElMessage.error('文件上传失败');
      return null;
    }
  };
  /**
   * 发送消息
   */
  const handleSendMessage = async (eventData) => {
    try {
      // 从 CustomEvent 的 detail[0] 中提取数据
      const { content, roomId, files, replyMessage } = eventData.detail[0];

      console.log('� 发送消息:', { content, roomId, files, replyMessage });

      // 验证内容
      if (!content && (!files || files.length === 0)) {
        console.warn('消息内容和文件都为空，取消发送');
        return;
      }

      const messageData = {
        roomId: roomId || '1',
        content: content || '',
        messageType: 'text'
      };

      // 如果有文件，先上传
      if (files && files.length > 0) {
        const file = files[0];

        // 上传文件到服务器
        const uploadedUrl = await uploadFile(file);
        
        
        if (!uploadedUrl) return; // 上传失败则不发送消息

        messageData.fileUrl = uploadedUrl;
        messageData.fileSize = file.size;
        messageData.fileName = file.name;

        if (file.audio) {
          messageData.messageType = 'audio';
          messageData.audioDuration = file.duration;
        } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.extension)) {
          messageData.messageType = 'image';
          messageData.thumbnailUrl = uploadedUrl;
        }
      }

      // 如果是回复消息
      if (replyMessage) {
        messageData.replyToId = parseInt(replyMessage._id);
      }

      // 通过 WebSocket 发送
      sendMessage(messageData);

    } catch (error) {
      console.error('发送消息失败:', error);
      ElMessage.error('发送消息失败');
    }};

            // 处理选择 GIF Sticker
      const handleSelectGif = async (gif) => {
    try {
      const messageData = {
        roomId: chatStore.currentRoom.roomId || '1',
        content: '',
        messageType: 'image',
        fileUrl: gif.url,
        fileName: gif.name
      };  // ← 这里需要分号

      sendMessage(messageData);  // ← 添加这行：实际发送消息

    } catch (error) {  // ← catch 前需要 } 闭合 try 块
      console.error('发送表情包失败:', error);
      ElMessage.error('发送表情包失败');
    }
  }; 

  /**
   * 编辑消息
   */
  const handleEditMessage = ({ roomId, messageId, newContent }) => {
    editMessage({
      messageId: parseInt(messageId),
      content: newContent,
      roomId: roomId || '1'
    });
  };

  /**
   * 删除消息
   */
  const handleDeleteMessage = ({ roomId, message }) => {
    deleteMessage({
      messageId: parseInt(message._id),
      roomId: roomId || '1'
    });
  };

  /**
   * 正在输入
   */
  let typingTimeout = null;
  
  const handleTyping = ({ message, roomId }) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (message && message.length > 0) {
      sendTyping(roomId || '1', true);

      typingTimeout = setTimeout(() => {
        sendTyping(roomId || '1', false);
      }, 3000);
    } else {
      sendTyping(roomId || '1', false);
    }
  };  // � handleTyping 到这里结束

  /**
   * 发送 emoji 反应
   */
  const handleSendReaction = async ({ roomId, messageId, reaction, remove }) => {
    try {
      await addReaction(messageId, reaction.emoji, remove);
      // 通过 WebSocket 通知其他用户（可选）
      // socket.emit('reaction', { messageId, reaction, remove });
    } catch (error) {
      ElMessage.error('操作失败');
    }
  };  // � handleSendReaction 独立的函数

  /**
   * 打开/下载文件
   */
  const handleOpenFile = ({ message, file }) => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      ElMessage.warning('文件 URL 不可用');
    }
  };  // � handleOpenFile 独立的函数
  </script>

  <style scoped>
 .chat-container {
    width: 100%;
    height: 100vh;
    position: relative;
  }

  .connection-status {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: 90%;
    max-width: 500px;
  }

  .online-count {
    position: absolute;
    top: 15px;
    right: 20px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 8px 16px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    color: #606266;
  }

  .online-count .el-icon {
    font-size: 18px;
  }
  </style>