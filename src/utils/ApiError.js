class ApiError extends Error{
    constructor(statusCode, message = "Something went wrong", errors = [], stack = ""){
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}

//Error.captureStackTrace(this, this.constructor) generates a stackTrace which is a list of function calls that led to the error

//Error.captureStackTrace(targetObject, func) tells Node.js:
// Create a stack trace for targetObject,
// but exclude everything above func in the trace.
//stack trace mai har baar sabse pehle constructor vala function aa jayega kyunki last vo call hua hai, toh usse hum exclude kar dete hain

//what does throw error do?
// Immediately stop executing the current function
// Exit all nested functions until you find a catch
// Give that catch the Error object
//if there is no catch:
// Immediately stop executing the current function
// Exit all nested functions until you find a catch
// Give that catch the Error object