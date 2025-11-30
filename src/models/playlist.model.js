import mongoose, { model, Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: String,
        videos: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Video"
                }
            ]
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

export const Playlist = model("Playlist", playlistSchema)