import {userRepository} from "./user.repository.js";

export const userService = {
  getAllUsers: () => {
    return userRepository.findAll();
  },
  getMe: (userId: string) => {
    return userRepository.findById(userId);
  },
};
