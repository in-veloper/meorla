import Notiflix from "notiflix";

const NotiflixWarn = (warnMessage) => {
    Notiflix.Notify.warning(warnMessage, {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
    });
};

export default NotiflixWarn;