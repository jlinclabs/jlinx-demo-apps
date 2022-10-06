export class ExpectedError extends Error {
  constructor(message){
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class UnauthorizedError extends ExpectedError {
  constructor(action){
    super(`you are not authorized${action ? `to ${action}` : ''}`);
    Object.assign(this, { action });
  }

  get status() { return 401 }
}

export class NotFoundError extends ExpectedError {
  constructor(objectName, id){
    super(`${objectName}${id ? ` id=${id}` : ''} not found`);
    Object.assign(this, { objectName, id });
  }

  get status() { return 404 }
}

export class MissingArgumentError extends ExpectedError {
  constructor(argumentName){
    super(`${argumentName} is required`);
  }

  get status() { return 400 }
}

export class InvalidArgumentError extends ExpectedError {
  constructor(argName, value){
    super(`${argName}${value ? `="${value}"` : ''} is invalid`);
    Object.assign(this, { argName, value });
  }

  get status() { return 400 }
}

