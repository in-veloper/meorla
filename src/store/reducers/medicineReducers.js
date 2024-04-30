import { FETCH_MEDICINE_DATA_SUCCESS, FETCH_GRAIN_MEDICINE_DATA_SUCCESS } from "store/actions/medicineActions";

const initialState = {
    medicineData: null,
    grainMedicineData: null
};

const medicineReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_MEDICINE_DATA_SUCCESS :
            return {
                ...state,
                medicineData: action.payload
            };
        case FETCH_GRAIN_MEDICINE_DATA_SUCCESS :
            return {
                ...state,
                grainMedicineData: action.payload
            };
        default : 
            return state;
    }
};

export default medicineReducer;