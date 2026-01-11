import mongoose, { Schema, model } from "mongoose";

const likeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

// Prevent duplicate likes

/*Agar aisa document bana jisme likedBy aur video field exactly same hai to an already created document, toh ye document create nhi hoga
aur jahan Like.create() call hua hai vahan ek error throw hoga "MongoServerError: E11000 duplicate key error collection: subscriptions"
jiska error code 11000 hoga */
likeSchema.index(
    { likedBy: 1, video: 1 },
    { unique: true, partialFilterExpression: { video: { $exists: true } } }
);

likeSchema.index(
    { likedBy: 1, comment: 1 },
    { unique: true, partialFilterExpression: { comment: { $exists: true } } }
);

likeSchema.index(
    { likedBy: 1, tweet: 1 },
    { unique: true, partialFilterExpression: { tweet: { $exists: true } } }
);

export const Like = model("Like", likeSchema)