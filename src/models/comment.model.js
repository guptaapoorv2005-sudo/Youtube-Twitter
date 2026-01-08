import mongoose, { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

commentSchema.index({ video: 1, createdAt: -1 })//This is known as compound index
//A compound index is an index that includes more than one field, stored together in a specific order.
//The index stores only indexed fields and document references not full documents
/*
The index stores (video, createdAt) pairs in a B-tree structure.
Entries are ordered first by video (ascending),
and for same videos, by createdAt (descending).
The index stores only indexed fields and document references,
not full documents.
*/

/*simple index: true likhte hain jab hume simple $lookup ya $match karna ho, but agar $match ke saath $sort bhi karna hai toh compound
index dono cheezein optimize kar dete hain*/ 

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = model("Comment", commentSchema)