(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://fahqgxaptucujjqecxgn.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_L0j_csPkSDdrlwN5SVK8zg_7dE5Ew-V");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 格式化日期為中文格式
 */ __turbopack_context__.s([
    "formatDate",
    ()=>formatDate,
    "formatDuration",
    ()=>formatDuration,
    "formatTime",
    ()=>formatTime,
    "getGroupTypeText",
    ()=>getGroupTypeText,
    "getStatusColor",
    ()=>getStatusColor,
    "getStatusText",
    ()=>getStatusText,
    "inferRegionFromLocation",
    ()=>inferRegionFromLocation
]);
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const weekdays = [
        '日',
        '一',
        '二',
        '三',
        '四',
        '五',
        '六'
    ];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    return `${date.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}(${weekday})`;
}
function formatTime(timeStr) {
    return timeStr.substring(0, 5);
}
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
function getStatusText(status) {
    switch(status){
        case 'A':
            return '招募中';
        case 'D':
            return '進行中';
        case 'F':
            return '已完成';
        default:
            return '未知';
    }
}
function getStatusColor(status) {
    switch(status){
        case 'A':
            return 'bg-blue-100 text-blue-700';
        case 'D':
            return 'bg-yellow-100 text-yellow-700';
        case 'F':
            return 'bg-green-100 text-green-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}
function getGroupTypeText(type) {
    switch(type){
        case 'B':
            return '男團';
        case 'G':
            return '女團';
        case 'M':
            return '混團';
        default:
            return '未知';
    }
}
function inferRegionFromLocation(location) {
    if (location.includes('雙連') || location.includes('台北') || location.includes('新北')) {
        return '雙北';
    } else if (location.includes('台中')) {
        return '台中';
    } else if (location.includes('高雄')) {
        return '高雄';
    } else if (location.includes('桃園')) {
        return '桃園';
    } else if (location.includes('新竹')) {
        return '新竹';
    } else if (location.includes('台南')) {
        return '台南';
    }
    return '';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ProjectCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProjectCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function ProjectCard(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(49);
    if ($[0] !== "68fb7d215e5a989e1f29ede6f91894e05f8a50429da9009a1ed649441b880428") {
        for(let $i = 0; $i < 49; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "68fb7d215e5a989e1f29ede6f91894e05f8a50429da9009a1ed649441b880428";
    }
    const { project } = t0;
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("userId") : "TURBOPACK unreachable";
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const userId = t1;
    let t2;
    if ($[2] !== project.creator_id) {
        t2 = userId && project.creator_id && project.creator_id.toString() === userId;
        $[2] = project.creator_id;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    const isCreator = t2;
    const canApply = !isCreator && !project.is_member && project.missing_positions && project.missing_positions.length > 0;
    let t3;
    if ($[4] !== project.porject_title) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
            className: "text-lg font-bold text-white flex-1 pr-2 leading-tight",
            children: project.porject_title
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 63,
            columnNumber: 10
        }, this);
        $[4] = project.porject_title;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] !== project.region) {
        t4 = project.region && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/30 text-white border border-white/50",
            children: project.region
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 71,
            columnNumber: 28
        }, this);
        $[6] = project.region;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    let t5;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: "bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border border-white/30",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-3.5 h-3.5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M5 13l4 4L19 7"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProjectCard.tsx",
                        lineNumber: 79,
                        columnNumber: 278
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 79,
                    columnNumber: 195
                }, this),
                "儲存"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 79,
            columnNumber: 10
        }, this);
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] !== t4) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: [
                t4,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 86,
            columnNumber: 10
        }, this);
        $[9] = t4;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] !== t3 || $[12] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gradient-to-r from-purple-500 to-pink-500 p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between",
                children: [
                    t3,
                    t6
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ProjectCard.tsx",
                lineNumber: 94,
                columnNumber: 76
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 94,
            columnNumber: 10
        }, this);
        $[11] = t3;
        $[12] = t6;
        $[13] = t7;
    } else {
        t7 = $[13];
    }
    let t8;
    if ($[14] !== project.missing_positions) {
        t8 = project.missing_positions && project.missing_positions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 mb-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4 text-pink-600",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ProjectCard.tsx",
                                    lineNumber: 103,
                                    columnNumber: 306
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ProjectCard.tsx",
                                lineNumber: 103,
                                columnNumber: 213
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectCard.tsx",
                            lineNumber: 103,
                            columnNumber: 130
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-semibold text-gray-800 text-sm",
                            children: "缺的位置"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectCard.tsx",
                            lineNumber: 103,
                            columnNumber: 459
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 103,
                    columnNumber: 84
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap gap-2",
                    children: project.missing_positions.map(_ProjectCardProjectMissing_positionsMap)
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 103,
                    columnNumber: 530
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 103,
            columnNumber: 79
        }, this);
        $[14] = project.missing_positions;
        $[15] = t8;
    } else {
        t8 = $[15];
    }
    let t9;
    if ($[16] !== project.practice_schedules) {
        t9 = project.practice_schedules && project.practice_schedules.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 mb-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-4 h-4 text-blue-600",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ProjectCard.tsx",
                                    lineNumber: 111,
                                    columnNumber: 308
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ProjectCard.tsx",
                                lineNumber: 111,
                                columnNumber: 215
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectCard.tsx",
                            lineNumber: 111,
                            columnNumber: 132
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-semibold text-gray-800 text-sm",
                            children: "練習時間"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectCard.tsx",
                            lineNumber: 111,
                            columnNumber: 437
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 111,
                    columnNumber: 86
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1.5 pl-8",
                    children: [
                        project.practice_schedules.slice(0, 3).map(_ProjectCardAnonymous),
                        project.practice_schedules.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-500 text-xs italic",
                            children: [
                                "還有 ",
                                project.practice_schedules.length - 3,
                                " 個時段..."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ProjectCard.tsx",
                            lineNumber: 111,
                            columnNumber: 651
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 111,
                    columnNumber: 508
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 111,
            columnNumber: 81
        }, this);
        $[16] = project.practice_schedules;
        $[17] = t9;
    } else {
        t9 = $[17];
    }
    let t10;
    if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-6 h-6 rounded-full bg-green-100 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4 text-green-600",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ProjectCard.tsx",
                                lineNumber: 119,
                                columnNumber: 235
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ProjectCard.tsx",
                                lineNumber: 119,
                                columnNumber: 391
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ProjectCard.tsx",
                        lineNumber: 119,
                        columnNumber: 141
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 119,
                    columnNumber: 57
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-semibold text-gray-800 text-sm",
                    children: "練習地點"
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 119,
                    columnNumber: 509
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 119,
            columnNumber: 11
        }, this);
        $[18] = t10;
    } else {
        t10 = $[18];
    }
    let t11;
    if ($[19] !== project.practice_location) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                t10,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-700 text-sm font-medium pl-8",
                    children: project.practice_location
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 126,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 126,
            columnNumber: 11
        }, this);
        $[19] = project.practice_location;
        $[20] = t11;
    } else {
        t11 = $[20];
    }
    let t12;
    if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mb-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4 text-purple-600",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectCard.tsx",
                            lineNumber: 134,
                            columnNumber: 237
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProjectCard.tsx",
                        lineNumber: 134,
                        columnNumber: 142
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 134,
                    columnNumber: 57
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-semibold text-gray-800 text-sm",
                    children: "拍攝"
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 134,
                    columnNumber: 453
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 134,
            columnNumber: 11
        }, this);
        $[21] = t12;
    } else {
        t12 = $[21];
    }
    let t13;
    if ($[22] !== project.performance_location) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                t12,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-700 text-sm font-medium pl-8 line-clamp-2",
                    children: project.performance_location
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectCard.tsx",
                    lineNumber: 141,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 141,
            columnNumber: 11
        }, this);
        $[22] = project.performance_location;
        $[23] = t13;
    } else {
        t13 = $[23];
    }
    let t14;
    if ($[24] !== t11 || $[25] !== t13 || $[26] !== t8 || $[27] !== t9) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-5 flex-1 space-y-4",
            children: [
                t8,
                t9,
                t11,
                t13
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 149,
            columnNumber: 11
        }, this);
        $[24] = t11;
        $[25] = t13;
        $[26] = t8;
        $[27] = t9;
        $[28] = t14;
    } else {
        t14 = $[28];
    }
    let t15;
    if ($[29] !== project.p_id || $[30] !== router) {
        t15 = ({
            "ProjectCard[<button>.onClick]": ()=>router.push(`/project/${project.p_id}`)
        })["ProjectCard[<button>.onClick]"];
        $[29] = project.p_id;
        $[30] = router;
        $[31] = t15;
    } else {
        t15 = $[31];
    }
    let t16;
    let t17;
    if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "group-hover:translate-x-0.5 transition-transform",
            children: "> Q"
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 172,
            columnNumber: 11
        }, this);
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "詳情"
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 173,
            columnNumber: 11
        }, this);
        $[32] = t16;
        $[33] = t17;
    } else {
        t16 = $[32];
        t17 = $[33];
    }
    let t18;
    if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-4 h-4 group-hover:scale-110 transition-transform",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            }, void 0, false, {
                fileName: "[project]/src/components/ProjectCard.tsx",
                lineNumber: 182,
                columnNumber: 133
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 182,
            columnNumber: 11
        }, this);
        $[34] = t18;
    } else {
        t18 = $[34];
    }
    let t19;
    if ($[35] !== t15) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t15,
            className: "text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1.5 transition-colors group",
            children: [
                t16,
                t17,
                t18
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 189,
            columnNumber: 11
        }, this);
        $[35] = t15;
        $[36] = t19;
    } else {
        t19 = $[36];
    }
    let t20;
    if ($[37] !== canApply || $[38] !== isCreator || $[39] !== project.p_id || $[40] !== router) {
        t20 = isCreator ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: {
                "ProjectCard[<button>.onClick]": ()=>router.push(`/project/manage/${project.p_id}`)
            }["ProjectCard[<button>.onClick]"],
            className: "px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105",
            children: "管理專案"
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 197,
            columnNumber: 23
        }, this) : canApply ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: {
                "ProjectCard[<button>.onClick]": ()=>router.push(`/project/${project.p_id}/apply`)
            }["ProjectCard[<button>.onClick]"],
            className: "px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105",
            children: "申請加入"
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 199,
            columnNumber: 286
        }, this) : null;
        $[37] = canApply;
        $[38] = isCreator;
        $[39] = project.p_id;
        $[40] = router;
        $[41] = t20;
    } else {
        t20 = $[41];
    }
    let t21;
    if ($[42] !== t19 || $[43] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-5 pb-5 pt-4 border-t border-gray-100 bg-gray-50/50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center gap-3",
                children: [
                    t19,
                    t20
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ProjectCard.tsx",
                lineNumber: 212,
                columnNumber: 82
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 212,
            columnNumber: 11
        }, this);
        $[42] = t19;
        $[43] = t20;
        $[44] = t21;
    } else {
        t21 = $[44];
    }
    let t22;
    if ($[45] !== t14 || $[46] !== t21 || $[47] !== t7) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 h-full flex flex-col",
            children: [
                t7,
                t14,
                t21
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProjectCard.tsx",
            lineNumber: 221,
            columnNumber: 11
        }, this);
        $[45] = t14;
        $[46] = t21;
        $[47] = t7;
        $[48] = t22;
    } else {
        t22 = $[48];
    }
    return t22;
}
_s(ProjectCard, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ProjectCard;
function _ProjectCardAnonymous(schedule, idx_0) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-gray-700 text-xs font-medium bg-gray-50 px-3 py-1.5 rounded-lg",
        children: [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(schedule.date),
            " ",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime"])(schedule.start_time),
            "-",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime"])(schedule.end_time)
        ]
    }, idx_0, true, {
        fileName: "[project]/src/components/ProjectCard.tsx",
        lineNumber: 232,
        columnNumber: 10
    }, this);
}
function _ProjectCardProjectMissing_positionsMap(position, idx) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-3 py-1.5 rounded-full text-xs font-medium border border-pink-200",
        children: position
    }, idx, false, {
        fileName: "[project]/src/components/ProjectCard.tsx",
        lineNumber: 235,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "ProjectCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/BottomNav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function BottomNav() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "53a7bfbbefe18b14d822e00b6f344d15eeedf4e4ca6f4353bce5c962398225b2") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "53a7bfbbefe18b14d822e00b6f344d15eeedf4e4ca6f4353bce5c962398225b2";
    }
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [
            {
                href: "/",
                label: "\u821E\u5718\u700F\u89BD",
                icon: "\uD83C\uDFE0"
            },
            {
                href: "/profile",
                label: "\u500B\u4EBA\u6A94\u6848",
                icon: "\uD83D\uDC64"
            }
        ];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const navItems = t0;
    let t1;
    if ($[2] !== pathname) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-around items-center py-2",
                children: navItems.map({
                    "BottomNav[navItems.map()]": (item)=>{
                        const isActive = pathname === item.href;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: item.href,
                            className: `flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${isActive ? "text-purple-600" : "text-gray-600 hover:text-gray-800"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-2xl",
                                    children: item.icon
                                }, void 0, false, {
                                    fileName: "[project]/src/components/BottomNav.tsx",
                                    lineNumber: 36,
                                    columnNumber: 215
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-medium",
                                    children: item.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/BottomNav.tsx",
                                    lineNumber: 36,
                                    columnNumber: 260
                                }, this)
                            ]
                        }, item.href, true, {
                            fileName: "[project]/src/components/BottomNav.tsx",
                            lineNumber: 36,
                            columnNumber: 20
                        }, this);
                    }
                }["BottomNav[navItems.map()]"])
            }, void 0, false, {
                fileName: "[project]/src/components/BottomNav.tsx",
                lineNumber: 33,
                columnNumber: 106
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/BottomNav.tsx",
            lineNumber: 33,
            columnNumber: 10
        }, this);
        $[2] = pathname;
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    return t1;
}
_s(BottomNav, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = BottomNav;
var _c;
__turbopack_context__.k.register(_c, "BottomNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ProjectCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ProjectCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BottomNav.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function Home() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [projects, setProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [filteredProjects, setFilteredProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        group: '',
        song: '',
        difficulty: '',
        region: ''
    });
    const [filterOptions, setFilterOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        groups: [],
        songs: [],
        regions: []
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            // 檢查是否已登入
            const userId = localStorage.getItem('userId');
            if (!userId) {
                router.push('/auth');
                return;
            }
            fetchFilterOptions();
            fetchProjects();
        }
    }["Home.useEffect"], [
        router
    ]);
    const fetchFilterOptions = async ()=>{
        // 獲取所有團體
        const { data: groupsData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_groups').select('group_id, group_name').order('group_name');
        // 獲取所有歌曲
        const { data: songsData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_songs').select('song_id, title, difficulty_level').order('title');
        setFilterOptions({
            groups: groupsData || [],
            songs: songsData || [],
            regions: [
                '雙北',
                '台中',
                '高雄',
                '桃園',
                '新竹',
                '台南'
            ]
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            // 搜尋和篩選邏輯
            let filtered = projects;
            // 搜尋專案標題
            if (searchQuery) {
                filtered = filtered.filter({
                    "Home.useEffect": (project)=>project.porject_title.toLowerCase().includes(searchQuery.toLowerCase()) || project.song?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || project.song?.group?.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
                }["Home.useEffect"]);
            }
            // 篩選團體
            if (filters.group) {
                filtered = filtered.filter({
                    "Home.useEffect": (project_0)=>project_0.song?.group?.group_name === filters.group
                }["Home.useEffect"]);
            }
            // 篩選歌曲
            if (filters.song) {
                filtered = filtered.filter({
                    "Home.useEffect": (project_1)=>project_1.song?.title === filters.song
                }["Home.useEffect"]);
            }
            // 篩選難度
            if (filters.difficulty) {
                const difficultyLevel = parseInt(filters.difficulty);
                filtered = filtered.filter({
                    "Home.useEffect": (project_2)=>{
                        if (!project_2.song?.difficulty_level) return false;
                        const level = project_2.song.difficulty_level;
                        if (difficultyLevel === 1) return level >= 1 && level <= 3;
                        if (difficultyLevel === 2) return level >= 4 && level <= 6;
                        if (difficultyLevel === 3) return level >= 7 && level <= 10;
                        return true;
                    }
                }["Home.useEffect"]);
            }
            // 篩選地區
            if (filters.region) {
                filtered = filtered.filter({
                    "Home.useEffect": (project_3)=>project_3.region === filters.region
                }["Home.useEffect"]);
            }
            setFilteredProjects(filtered);
        }
    }["Home.useEffect"], [
        searchQuery,
        filters,
        projects
    ]);
    const fetchProjects = async ()=>{
        try {
            setLoading(true);
            // 獲取所有活躍的專案
            const { data: projectsData, error: projectsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project').select(`
          p_id,
          porject_title,
          practice_location,
          performance_location,
          status,
          song_id,
          creator_id
        `).eq('status', 'A').order('create_at', {
                ascending: false
            }).limit(100);
            if (projectsError) throw projectsError;
            // 獲取每個專案的詳細資訊
            const projectsWithDetails = await Promise.all((projectsData || []).map(async (project_4)=>{
                // 獲取練習時間
                const { data: schedules } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('practice_schedule').select('date, start_time, end_time').eq('p_id', project_4.p_id).order('date', {
                    ascending: true
                });
                // 獲取缺少的位置
                const { data: targets } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_target').select('target_seq, idol_id, status').eq('project_id', project_4.p_id).eq('status', 'I');
                // 獲取對應的偶像名稱
                const missingPositions = [];
                if (targets && targets.length > 0) {
                    for (const target of targets){
                        if (target.idol_id) {
                            const { data: idol } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_idols').select('stage_name').eq('idol_id', target.idol_id).single();
                            if (idol) {
                                missingPositions.push(idol.stage_name);
                            } else {
                                missingPositions.push(`位置 ${target.target_seq}`);
                            }
                        } else {
                            missingPositions.push(`位置 ${target.target_seq}`);
                        }
                    }
                }
                // 獲取歌曲資訊
                let songInfo = null;
                if (project_4.song_id) {
                    const { data: song } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_songs').select('title, difficulty_level').eq('song_id', project_4.song_id).single();
                    if (song) {
                        // 獲取歌曲對應的團體
                        const { data: songGroups } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('song_group').select('group_id').eq('song_id', project_4.song_id).limit(1);
                        let groupName = null;
                        if (songGroups && songGroups.length > 0) {
                            const { data: group } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_groups').select('group_name').eq('group_id', songGroups[0].group_id).single();
                            if (group) {
                                groupName = group.group_name;
                            }
                        }
                        songInfo = {
                            title: song.title,
                            difficulty_level: song.difficulty_level,
                            group: groupName ? {
                                group_name: groupName
                            } : undefined
                        };
                    }
                }
                // 從 practice_location 推斷地區
                const region = project_4.practice_location.includes('雙連') || project_4.practice_location.includes('台北') || project_4.practice_location.includes('新北') ? '雙北' : project_4.practice_location.includes('台中') ? '台中' : project_4.practice_location.includes('高雄') ? '高雄' : project_4.practice_location.includes('桃園') ? '桃園' : project_4.practice_location.includes('新竹') ? '新竹' : project_4.practice_location.includes('台南') ? '台南' : '';
                // 檢查用戶是否為專案成員
                let userIsMember = false;
                const userId_0 = localStorage.getItem('userId');
                if (userId_0) {
                    const { data: memberCheck } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_members').select('member_id').eq('p_id', project_4.p_id).eq('member_id', userId_0).eq('status', 'Y').single();
                    userIsMember = !!memberCheck;
                }
                return {
                    ...project_4,
                    practice_schedules: schedules || [],
                    missing_positions: missingPositions,
                    song: songInfo || undefined,
                    region,
                    creator_id: project_4.creator_id,
                    is_member: userIsMember
                };
            }));
            setProjects(projectsWithDetails);
            setFilteredProjects(projectsWithDetails);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 py-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-5xl font-bold text-purple-600 mb-4 flex items-center justify-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-4xl",
                                        children: "👨"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 239,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "舞告Match"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 240,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-4xl",
                                        children: "👩"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 241,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push('/project/create'),
                                className: "px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors",
                                children: "+ 建立新專案"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 243,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 253,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 252,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: searchQuery,
                                        onChange: (e)=>setSearchQuery(e.target.value),
                                        placeholder: "搜尋團名、歌曲...",
                                        className: "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 255,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 251,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-4 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filters.group,
                                        onChange: (e_0)=>setFilters({
                                                ...filters,
                                                group: e_0.target.value
                                            }),
                                        className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "全部團體"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 264,
                                                columnNumber: 15
                                            }, this),
                                            filterOptions.groups.map((group_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: group_0.group_name,
                                                    children: group_0.group_name
                                                }, group_0.group_id, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 265,
                                                    columnNumber: 52
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filters.song,
                                        onChange: (e_1)=>setFilters({
                                                ...filters,
                                                song: e_1.target.value
                                            }),
                                        className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "全部歌曲"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 274,
                                                columnNumber: 15
                                            }, this),
                                            filterOptions.songs.map((song_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: song_0.title,
                                                    children: song_0.title
                                                }, song_0.song_id, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 275,
                                                    columnNumber: 50
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 270,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filters.difficulty,
                                        onChange: (e_2)=>setFilters({
                                                ...filters,
                                                difficulty: e_2.target.value
                                            }),
                                        className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "全部難度"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 284,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "1",
                                                children: "難度 1-3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 285,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "2",
                                                children: "難度 4-6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 286,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "3",
                                                children: "難度 7-10"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 287,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 280,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filters.region,
                                        onChange: (e_3)=>setFilters({
                                                ...filters,
                                                region: e_3.target.value
                                            }),
                                        className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "全部地區"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 294,
                                                columnNumber: 15
                                            }, this),
                                            filterOptions.regions.map((region_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: region_0,
                                                    children: region_0
                                                }, region_0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 295,
                                                    columnNumber: 54
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 290,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 259,
                                columnNumber: 11
                            }, this),
                            (filters.group || filters.song || filters.difficulty || filters.region || searchQuery) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setFilters({
                                        group: '',
                                        song: '',
                                        difficulty: '',
                                        region: ''
                                    });
                                    setSearchQuery('');
                                },
                                className: "text-sm text-purple-600 hover:text-purple-700",
                                children: "清除所有篩選"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 302,
                                columnNumber: 102
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-end items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-600",
                                        children: "✨"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 315,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-medium",
                                        children: [
                                            "找到 ",
                                            filteredProjects.length,
                                            " 個團體"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 316,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 314,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-span-full text-center py-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 323,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 text-gray-600",
                                    children: "載入中..."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 324,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 322,
                            columnNumber: 22
                        }, this) : filteredProjects.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-span-full text-center py-12",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600",
                                children: "目前沒有找到符合條件的專案"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 326,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 325,
                            columnNumber: 54
                        }, this) : filteredProjects.map((project_5)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ProjectCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                project: project_5
                            }, project_5.p_id, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 327,
                                columnNumber: 56
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 235,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 332,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 234,
        columnNumber: 10
    }, this);
}
_s(Home, "j/J3iPJ03dG7RYbUpV6Kmcj4eMU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_b24649e1._.js.map