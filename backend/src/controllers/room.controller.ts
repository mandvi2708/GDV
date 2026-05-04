import { Request, Response, NextFunction } from 'express';
import Room from '../models/Room';
import User from '../models/User';

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req: any, res: Response, next: NextFunction) => {
  try {
    req.body.creator = req.user.id;
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rooms (filtered by status)
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const query: any = { isPublic: true };
    if (status) query.status = status;

    const rooms = await Room.find(query)
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findById(req.params.id).populate('creator', 'name avatar');

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End discussion session
// @route   PATCH /api/rooms/:id/end
// @access  Private
export const endRoom = async (req: any, res: Response, next: NextFunction) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    // Check if user is the creator
    if (room.creator.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Only host can end the session' });
      return;
    }

    room.status = 'ended';
    room.endedAt = new Date();
    
    if (req.body.summary) room.summary = req.body.summary;
    if (req.body.duration) room.duration = req.body.duration;
    if (req.body.participationStats) room.participationStats = req.body.participationStats;

    await room.save();

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global statistics
// @route   GET /api/rooms/stats/global
// @access  Public
export const getGlobalStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const liveRooms = await Room.countDocuments({ status: 'live' });
    const totalUsers = await User.countDocuments();
    
    const durationAgg = await Room.aggregate([
      { $match: { status: 'ended', duration: { $exists: true } } },
      { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
    ]);
    
    const avgDurationSeconds = durationAgg.length > 0 ? Math.round(durationAgg[0].avgDuration) : 0;
    const avgDurationMins = Math.round(avgDurationSeconds / 60);

    const aiSummaries = await Room.countDocuments({ summary: { $exists: true, $ne: "" } });

    res.status(200).json({
      success: true,
      data: {
        liveRooms: liveRooms || 0,
        activeUsers: totalUsers || 0,
        avgDuration: `${avgDurationMins}m`,
        aiSummaries: aiSummaries || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
