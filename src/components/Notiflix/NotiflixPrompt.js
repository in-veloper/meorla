import Notiflix from "notiflix";

const NotiflixPrompt = (askTitle, askMessage, promptMessage, yesText, noText, yesCallback, noCallback, askWidth) => {
    // const inputPromptValue = prompt(promptMessage);
    // prompt에 입력한 값이 출력되지 않는 현상 처리 필요
    return (
        Notiflix.Confirm.prompt(
            askTitle,
            askMessage,
            promptMessage,
            yesText,
            noText,
            async (promptValue) => {
                if(typeof yesCallback === 'function') {
                    await yesCallback(promptValue);
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

export default NotiflixPrompt;