import Notiflix from "notiflix";

const NotiflixAsk = (askTitle, askMessage, promptMessage, yesText, noText, yesCallback, noCallback, askWidth) => {
    const inputPromptValue = prompt(promptMessage);
    // prompt에 입력한 값이 출력되지 않는 현상 처리 필요
    return (
        Notiflix.Confirm.ask(
            askTitle,
            askMessage,
            promptMessage,
            yesText,
            noText,
            async () => {
                if(typeof yesCallback === 'function') {
                    await yesCallback(inputPromptValue);
                }
            },() => {
                if(typeof noCallback === 'function') {
                    noCallback();
                }
            },{
                position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: askWidth ? askWidth : '280px'
            }
        )
    );
};

export default NotiflixAsk;