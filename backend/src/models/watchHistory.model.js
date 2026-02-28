import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const watchHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: true }
);

watchHistorySchema.index({ user: 1, video: 1 }, { unique: true }); // one entry per user-video pair
watchHistorySchema.index({ user: 1, updatedAt: -1 });              // fast "recent history" queries

watchHistorySchema.plugin(mongooseAggregatePaginate);

export const WatchHistory = model("WatchHistory", watchHistorySchema);