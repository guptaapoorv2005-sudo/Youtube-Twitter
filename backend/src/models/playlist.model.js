import mongoose, { model, Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: String,
        isPublic: {
            type: Boolean,
            default: true
        },
        videos: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Video"
                }
            ]
        },
        totalVideos: {
            type: Number,
            default: 0
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {timestamps: true}
)

playlistSchema.index(  //prevents same user to have different playlists with same name
  { name: 1, owner: 1 },
  { unique: true }
)

playlistSchema.index({
    owner: 1,
    isPublic: 1,
    createdAt: -1
})

export const Playlist = model("Playlist", playlistSchema)