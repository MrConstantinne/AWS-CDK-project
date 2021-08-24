import { Space } from './Model';

export class MissingFieldError extends Error {
}

export const validateAsSpaceEntry = (arg: Space) => {
    if (!arg.name) {
        throw new MissingFieldError('name is required!');
    }
    if (!arg.spaceId) {
        throw new MissingFieldError('spaceId is required!');
    }
    if (!arg.location) {
        throw new MissingFieldError('location is required!');
    }
};
