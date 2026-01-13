import mongoose, { model, Schema } from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
    },
    {timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate)

videoSchema.index({ owner: 1, isPublished: 1, createdAt: -1 })
videoSchema.index({ owner: 1, isPublished: 1, views: -1, _id: -1})

export const Video = model("Video",videoSchema)