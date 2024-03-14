import Notiflix from "notiflix";

const NotiflixInfo = (infoMessage) => {
    Notiflix.Notify.info(infoMessage, {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
    });
};

export default NotiflixInfo;