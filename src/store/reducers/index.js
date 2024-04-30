import { combineReducers } from "redux";
import medicineReducer from './medicineReducers';

const rootReducer = combineReducers({
    medicine: medicineReducer
});

export default rootReducer;