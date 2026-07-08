import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { logger } from '../core/logger';
import { redisService } from './RedisService';

class SocketService {
  private io: Server | null = null;
  private onlineUsers = new Set<string>();

  public initialize(server: HttpServer): Server {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    const redisClient = redisService.getClient();
    if (redisService.getIsConnected() && redisClient) {
      try {
        const subClient = redisClient.duplicate();
        this.io.adapter(createAdapter(redisClient, subClient));
        logger.info('Socket.IO successfully clustered with Redis Adapter.');
      } catch (err: any) {
        logger.warn(`Failed to set up Redis Socket.IO adapter: ${err.message}. Using standard adapter.`);
      }
    } else {
      logger.info('Redis offline. Socket.IO using default local memory adapter.');
    }

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    return this.io;
  }

  private handleConnection(socket: Socket) {
    const socketId = socket.id;
    this.onlineUsers.add(socketId);
    
    // Broadcast updated online count
    this.broadcastOnlineCount();
    logger.debug(`Socket client connected: ${socketId}. Total online: ${this.onlineUsers.size}`);

    // Join room for custom notifications
    socket.on('join_user_channel', (userId: string) => {
      socket.join(`user:${userId}`);
      logger.debug(`Socket client ${socketId} joined user channel: user:${userId}`);
    });

    // Custom real-time voting handler
    socket.on('cast_vote', (voteData: { contestantId: string; voterId: string }) => {
      logger.info(`Real-time vote cast for ${voteData.contestantId} by ${voteData.voterId}`);
      // Simulate scoring changes and broadcast to all
      this.broadcastVoteUpdate(voteData.contestantId, Math.floor(Math.random() * 50) + 1);
    });

    socket.on('disconnect', () => {
      this.onlineUsers.delete(socketId);
      this.broadcastOnlineCount();
      logger.debug(`Socket client disconnected: ${socketId}. Total online: ${this.onlineUsers.size}`);
    });
  }

  public getOnlineCount(): number {
    return this.onlineUsers.size;
  }

  private broadcastOnlineCount() {
    if (this.io) {
      this.io.emit('online_count', { count: this.onlineUsers.size });
    }
  }

  public broadcastLeaderboard(rankings: any) {
    if (this.io) {
      this.io.emit('leaderboard_update', rankings);
    }
  }

  public broadcastVoteUpdate(contestantId: string, votesCount: number) {
    if (this.io) {
      this.io.emit('vote_update', { contestantId, votesCount });
    }
  }

  public broadcastNotification(userId: string, notification: { title: string; message: string; type: string }) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification', notification);
    }
  }

  public emitToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  public getIO(): Server | null {
    return this.io;
  }
}

export const socketService = new SocketService();
export default socketService;
