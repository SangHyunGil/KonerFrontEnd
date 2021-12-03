import axios from "axios";

export const findAllRooms = async (accessToken) => {
    return await axios.get("/room");
}

export const createRoom = async (roomName, memberId, accessToken) => {
    return await axios.post("/room", {
        roomName : roomName,
        memberId : memberId
    }, {
        headers: {
            "X-AUTH-TOKEN": accessToken
        }
    })
}

export const findAllChats = async (roomId, accessToken) => {
    return await axios.get("/room/"+roomId, {
        headers: {
            "X-AUTH-TOKEN": accessToken
        }
    });
}