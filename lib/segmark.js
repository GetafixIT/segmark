"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmark = void 0;
const gray_matter_1 = __importDefault(require("gray-matter"));
const getApiData = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resp = yield fetch(url);
        return yield resp.json();
    }
    catch (err) {
        return `${url}`;
    }
});
const segmark = (markdownStr, isUri = false) => __awaiter(void 0, void 0, void 0, function* () {
    let stringToProcess = markdownStr;
    let greyMatterData = { data: {} };
    if (isUri) {
        stringToProcess = yield getApiData(markdownStr);
    }
    else {
        greyMatterData = (0, gray_matter_1.default)(markdownStr);
    }
    const regexSection = new RegExp(`(±.*?)[\\s\\S]*?\\1`, 'gi');
    const markdownSections = stringToProcess.match(regexSection) || [];
    const obj = Object.assign({}, (!!Object.keys(greyMatterData.data).length ? { vars: greyMatterData.data } : {}));
    let item;
    if (markdownSections.length) {
        for (item of markdownSections) {
            const segmentMatch = item.match(/±(.*?)\n([^;]*)±/);
            let [, varName, segment] = segmentMatch !== null && segmentMatch !== void 0 ? segmentMatch : [];
            if (varName && segment) {
                segment = segment.trim();
                const isApi = varName.indexOf('api_') > -1;
                let slot;
                if (isApi) {
                    varName = varName.replace('api_', '');
                    const data = yield getApiData(segment);
                    slot = yield segmark(data);
                }
                try {
                    if (!isApi) {
                        slot = JSON.parse(segment);
                    }
                    obj[varName] = slot;
                }
                catch (err) {
                    obj[varName] = segment;
                }
            }
        }
    }
    return markdownSections.length !== 0 ? obj : { markdown: markdownStr.trim() };
});
exports.segmark = segmark;
exports.default = { segmark };
