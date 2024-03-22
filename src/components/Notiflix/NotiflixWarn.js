import Notiflix from "notiflix";

const NotiflixWarn = (warnMessage, warnWidth) => {
    Notiflix.Notify.warning(warnMessage, {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: warnWidth ? warnWidth : '280px'
    });
};

export default NotiflixWarn;