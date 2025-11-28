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
"[project]/src/app/project/create/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateProjectPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BottomNav.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function CreateProjectPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [songs, setSongs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        song_id: '',
        porject_title: '',
        target_cnt: '',
        practice_location: '',
        performance_location: '',
        discription: ''
    });
    const [practiceSchedules, setPracticeSchedules] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [targetPositions, setTargetPositions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [idols, setIdols] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [songIdols, setSongIdols] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedPosition, setSelectedPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(''); // 用戶選擇自己要跳的位置
    const [dancerCount, setDancerCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('0'); // 伴舞數量
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateProjectPage.useEffect": ()=>{
            const id = localStorage.getItem('userId');
            if (!id) {
                router.push('/auth');
                return;
            }
            setUserId(id);
            fetchSongs();
        }
    }["CreateProjectPage.useEffect"], [
        router
    ]);
    // 當選取歌曲時，獲取團體成員數和該歌曲的偶像列表
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateProjectPage.useEffect": ()=>{
            if (formData.song_id) {
                fetchSongGroupInfo(formData.song_id);
                fetchSongIdols(formData.song_id);
            } else {
                setSongIdols([]);
                setSelectedPosition('');
                setTargetPositions([]);
            }
        }
    }["CreateProjectPage.useEffect"], [
        formData.song_id
    ]);
    // 當用戶選擇自己要跳的位置時，自動生成要徵的位置列表
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateProjectPage.useEffect": ()=>{
            if (selectedPosition && songIdols.length > 0) {
                // 過濾掉用戶選擇的位置，剩下的就是要徵的位置
                // 使用原始索引作為 target_seq，確保不重複
                const positions = songIdols.map({
                    "CreateProjectPage.useEffect.positions": (idol, originalIndex)=>({
                            originalIndex: originalIndex + 1,
                            // 原始位置編號（從1開始）
                            idol: idol
                        })
                }["CreateProjectPage.useEffect.positions"]).filter({
                    "CreateProjectPage.useEffect.positions": (item)=>item.idol.idol_id.toString() !== selectedPosition
                }["CreateProjectPage.useEffect.positions"]).map({
                    "CreateProjectPage.useEffect.positions": (item_0)=>({
                            target_seq: item_0.originalIndex,
                            // 使用原始位置編號
                            idol_id: item_0.idol.idol_id.toString()
                        })
                }["CreateProjectPage.useEffect.positions"]);
                setTargetPositions(positions);
            } else {
                setTargetPositions([]);
            }
        }
    }["CreateProjectPage.useEffect"], [
        selectedPosition,
        songIdols
    ]);
    const fetchSongs = async ()=>{
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_songs').select('song_id, title, difficulty_level').order('title');
        if (data) setSongs(data);
    };
    // 獲取歌曲對應的團體資訊和成員數
    const fetchSongGroupInfo = async (songId)=>{
        try {
            // 獲取歌曲對應的團體
            const { data: songGroups } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('song_group').select('group_id').eq('song_id', parseInt(songId)).limit(1);
            if (songGroups && songGroups.length > 0) {
                // 獲取團體的成員數
                const { data: group } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_groups').select('member_count').eq('group_id', songGroups[0].group_id).single();
                if (group) {
                    // 自動設定目標人數為團體成員數
                    setFormData((prev)=>({
                            ...prev,
                            target_cnt: group.member_count.toString()
                        }));
                }
            }
        } catch (err) {
            console.error('Error fetching group info:', err);
        }
    };
    // 獲取歌曲對應的所有偶像
    const fetchSongIdols = async (songId_0)=>{
        try {
            // 獲取歌曲對應的偶像
            const { data: songIdolsData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('song_idol').select('idol_id').eq('song_id', parseInt(songId_0));
            if (songIdolsData && songIdolsData.length > 0) {
                const idolIds = songIdolsData.map((item_1)=>item_1.idol_id);
                // 獲取這些偶像的詳細資訊
                const { data: idolsData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_idols').select(`
            idol_id,
            stage_name,
            kpop_groups!inner(group_name)
          `).in('idol_id', idolIds);
                if (idolsData) {
                    const formattedIdols = idolsData.map((item_2)=>({
                            idol_id: item_2.idol_id,
                            stage_name: item_2.stage_name,
                            group_name: item_2.kpop_groups?.group_name || ''
                        }));
                    setSongIdols(formattedIdols);
                }
            } else {
                setSongIdols([]);
            }
        } catch (err_0) {
            console.error('Error fetching song idols:', err_0);
            setSongIdols([]);
        }
    };
    const addPracticeSchedule = ()=>{
        // 確保新增的時間欄位都是空字串，避免瀏覽器顯示預設值
        setPracticeSchedules([
            ...practiceSchedules,
            {
                date: '',
                start_time: '',
                end_time: ''
            }
        ]);
    };
    const removePracticeSchedule = (index)=>{
        setPracticeSchedules(practiceSchedules.filter((_, i)=>i !== index));
    };
    const updatePracticeSchedule = (index_0, field, value)=>{
        const updated = [
            ...practiceSchedules
        ];
        // 確保時間值為空字串而不是 undefined 或 null
        updated[index_0] = {
            ...updated[index_0],
            [field]: value === null || value === undefined ? '' : value
        };
        setPracticeSchedules(updated);
    };
    // 生成小時選項（0-23）
    const generateHourOptions = ()=>{
        return Array.from({
            length: 24
        }, (__0, i_0)=>{
            const hour = i_0.toString().padStart(2, '0');
            return {
                value: hour,
                label: `${hour}時`
            };
        });
    };
    // 生成分鐘選項（0, 15, 30, 45）
    const generateMinuteOptions = ()=>{
        return [
            0,
            15,
            30,
            45
        ].map((min)=>{
            const minute = min.toString().padStart(2, '0');
            return {
                value: minute,
                label: `${minute}分`
            };
        });
    };
    // 組合小時和分鐘為時間字串（允許部分值）
    const combineTime = (hour_0, minute_0)=>{
        // 如果兩個值都存在，組合為 HH:MM
        if (hour_0 && minute_0) {
            return `${hour_0}:${minute_0}`;
        }
        // 如果只有小時，保存為 HH:（用於顯示已選擇的小時）
        if (hour_0 && !minute_0) {
            return `${hour_0}:`;
        }
        // 如果只有分鐘，需要小時才能組合（這種情況不應該發生，但為了安全）
        if (!hour_0 && minute_0) {
            return `:${minute_0}`;
        }
        // 兩個都沒有，返回空字串
        return '';
    };
    // 解析時間字串為小時和分鐘（處理部分值）
    const parseTime = (timeString)=>{
        if (!timeString || timeString === '') {
            return {
                hour: '',
                minute: ''
            };
        }
        // 處理 HH: 格式（只有小時）
        if (timeString.endsWith(':') && !timeString.includes(':', 3)) {
            const hour_1 = timeString.replace(':', '');
            return {
                hour: hour_1 || '',
                minute: ''
            };
        }
        // 處理 :MM 格式（只有分鐘，不應該發生）
        if (timeString.startsWith(':') && timeString.length === 3) {
            const minute_1 = timeString.replace(':', '');
            return {
                hour: '',
                minute: minute_1 || ''
            };
        }
        // 正常格式 HH:MM
        const [hour_2, minute_2] = timeString.split(':');
        return {
            hour: hour_2 || '',
            minute: minute_2 || ''
        };
    };
    // 更新時間（小時或分鐘）
    const updateTime = (index_1, timeType, part, value_0)=>{
        const schedule = practiceSchedules[index_1];
        const currentTime = schedule[timeType] || '';
        const { hour: hour_3, minute: minute_3 } = parseTime(currentTime);
        const newHour = part === 'hour' ? value_0 : hour_3;
        const newMinute = part === 'minute' ? value_0 : minute_3;
        const newTime = combineTime(newHour, newMinute);
        updatePracticeSchedule(index_1, timeType, newTime);
    };
    // 處理用戶選擇自己要跳的位置
    const handleSelectPosition = (idolId)=>{
        setSelectedPosition(idolId);
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!userId) return;
        try {
            setLoading(true);
            setError('');
            // 驗證：如果選了歌曲，必須選擇自己要跳的位置
            if (formData.song_id && !selectedPosition) {
                setError('請選擇你要跳的位置');
                setLoading(false);
                return;
            }
            // 驗證：至少需要一個練習時間
            const validSchedules = practiceSchedules.filter((s)=>s.date && s.start_time && s.end_time);
            if (validSchedules.length === 0) {
                setError('請至少新增一個練習時間');
                setLoading(false);
                return;
            }
            // 生成專案ID
            const generateProjectId = ()=>{
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 10000);
                return timestamp * 10000 + random;
            };
            let newProjectId = generateProjectId();
            let attempts = 0;
            while(attempts < 10){
                const { data: checkId } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project').select('p_id').eq('p_id', newProjectId).single();
                if (!checkId) break;
                newProjectId = generateProjectId();
                attempts++;
            }
            if (attempts >= 10) {
                setError('系統繁忙，請稍後再試');
                return;
            }
            const now = new Date().toISOString();
            // 創建專案
            const { error: projectError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project').insert({
                p_id: newProjectId,
                creator_id: userId,
                song_id: formData.song_id ? parseInt(formData.song_id) : null,
                porject_title: formData.porject_title,
                target_cnt: parseInt(formData.target_cnt),
                practice_location: formData.practice_location,
                performance_location: formData.performance_location,
                create_at: now,
                update_at: now,
                status: 'A',
                // 招募中
                discription: formData.discription || null
            });
            if (projectError) throw projectError;
            // 創建練習時間表
            const schedules = validSchedules.map((s_0)=>({
                    p_id: newProjectId,
                    date: s_0.date,
                    start_time: s_0.start_time,
                    end_time: s_0.end_time
                }));
            if (schedules.length > 0) {
                const { error: scheduleError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('practice_schedule').insert(schedules);
                if (scheduleError) throw scheduleError;
            }
            // 創建所有目標位置（包括用戶選擇的、要徵的、和伴舞）
            const allTargets = [];
            // 添加要徵的位置（空缺）
            const targets = targetPositions.filter((t)=>t.idol_id).map((t_0)=>({
                    target_seq: t_0.target_seq,
                    project_id: newProjectId,
                    idol_id: parseInt(t_0.idol_id),
                    status: 'I'
                }));
            allTargets.push(...targets);
            // 如果用戶選擇了自己要跳的位置，添加為已填滿的位置
            let userPositionSeq = null;
            if (selectedPosition) {
                // 找到用戶選擇的位置在原始列表中的索引
                const selectedIndex = songIdols.findIndex((idol_0)=>idol_0.idol_id.toString() === selectedPosition);
                if (selectedIndex !== -1) {
                    // 用戶選擇的位置編號（從1開始）
                    userPositionSeq = selectedIndex + 1;
                    // 檢查是否已經存在（理論上不應該，但為了安全）
                    const exists = allTargets.some((t_1)=>t_1.target_seq === userPositionSeq);
                    if (!exists) {
                        allTargets.push({
                            target_seq: userPositionSeq,
                            project_id: newProjectId,
                            idol_id: parseInt(selectedPosition),
                            status: 'F' // 已填滿
                        });
                    }
                }
            }
            // 添加伴舞位置（idol_id 為 NULL）
            const dancerCountNum = parseInt(dancerCount) || 0;
            if (dancerCountNum > 0) {
                // 找出最大的 target_seq，伴舞從下一個開始編號
                // 需要考慮所有已添加的位置（包括偶像位置）
                const existingSeqs = allTargets.map((t_2)=>t_2.target_seq);
                const maxIdolSeq = songIdols.length; // 偶像的最大編號
                const maxTargetSeq = existingSeqs.length > 0 ? Math.max(...existingSeqs, maxIdolSeq) : maxIdolSeq;
                // 為每個伴舞創建一個位置
                for(let i_1 = 1; i_1 <= dancerCountNum; i_1++){
                    allTargets.push({
                        target_seq: maxTargetSeq + i_1,
                        project_id: newProjectId,
                        idol_id: null,
                        // 伴舞的 idol_id 為 NULL
                        status: 'I' // 空缺
                    });
                }
            }
            // 先一次性插入所有目標位置（必須在插入 project_members 之前）
            if (allTargets.length > 0) {
                const { error: targetError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_target').insert(allTargets);
                if (targetError) throw targetError;
            }
            // 如果用戶選擇了自己要跳的位置，將創建者加入專案成員（在 project_target 插入之後）
            if (selectedPosition && userPositionSeq !== null) {
                const { error: memberError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_members').insert({
                    p_id: newProjectId,
                    member_id: userId,
                    join_date: new Date().toISOString().split('T')[0],
                    target_seq: userPositionSeq,
                    status: 'Y'
                });
                if (memberError) throw memberError;
            }
            router.push(`/project/manage/${newProjectId}`);
        } catch (err_1) {
            setError('建立失敗：' + (err_1.message || '未知錯誤'));
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4 py-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-purple-600",
                                children: "建立翻跳專案"
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/create/page.tsx",
                                lineNumber: 436,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.back(),
                                className: "text-gray-600 hover:text-gray-800",
                                children: "← 返回"
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/create/page.tsx",
                                lineNumber: 437,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/project/create/page.tsx",
                        lineNumber: 435,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/project/create/page.tsx",
                        lineNumber: 442,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSubmit,
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl shadow-md p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-bold text-gray-800 mb-4",
                                        children: "基本資訊"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 449,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "專案標題 *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 452,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: formData.porject_title,
                                                        onChange: (e_0)=>setFormData({
                                                                ...formData,
                                                                porject_title: e_0.target.value
                                                            }),
                                                        maxLength: 50,
                                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 453,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 451,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "翻跳歌曲（選填）"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 459,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: formData.song_id,
                                                        onChange: (e_1)=>setFormData({
                                                                ...formData,
                                                                song_id: e_1.target.value
                                                            }),
                                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "",
                                                                children: "無"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                lineNumber: 464,
                                                                columnNumber: 19
                                                            }, this),
                                                            songs.map((song)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: song.song_id,
                                                                    children: [
                                                                        song.title,
                                                                        " (難度: ",
                                                                        song.difficulty_level,
                                                                        "/10)"
                                                                    ]
                                                                }, song.song_id, true, {
                                                                    fileName: "[project]/src/app/project/create/page.tsx",
                                                                    lineNumber: 465,
                                                                    columnNumber: 38
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 460,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 458,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: [
                                                            "目標人數 *",
                                                            formData.song_id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-gray-500 ml-2",
                                                                children: "(已根據團體成員數自動填入)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                lineNumber: 473,
                                                                columnNumber: 40
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 471,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: formData.target_cnt,
                                                        onChange: (e_2)=>setFormData({
                                                                ...formData,
                                                                target_cnt: e_2.target.value
                                                            }),
                                                        min: "1",
                                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 477,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 470,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "練習地點 *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 483,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: formData.practice_location,
                                                        onChange: (e_3)=>setFormData({
                                                                ...formData,
                                                                practice_location: e_3.target.value
                                                            }),
                                                        maxLength: 50,
                                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 484,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 482,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "拍攝地點 *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 490,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: formData.performance_location,
                                                        onChange: (e_4)=>setFormData({
                                                                ...formData,
                                                                performance_location: e_4.target.value
                                                            }),
                                                        maxLength: 50,
                                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 491,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 489,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                                        children: "專案描述"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 497,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        value: formData.discription,
                                                        onChange: (e_5)=>setFormData({
                                                                ...formData,
                                                                discription: e_5.target.value
                                                            }),
                                                        maxLength: 500,
                                                        rows: 4,
                                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 498,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 496,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 450,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/project/create/page.tsx",
                                lineNumber: 448,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl shadow-md p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-xl font-bold text-gray-800",
                                                children: "練習時間"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 509,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: addPracticeSchedule,
                                                className: "px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700",
                                                children: "+ 新增時間"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 510,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 508,
                                        columnNumber: 13
                                    }, this),
                                    practiceSchedules.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 text-center py-4",
                                        children: "點擊「+ 新增時間」來新增練習時間"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 514,
                                        columnNumber: 47
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: practiceSchedules.map((schedule_0, index_2)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-3 items-end",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-700 mb-1",
                                                                children: "日期"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                lineNumber: 519,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "date",
                                                                value: schedule_0.date || '',
                                                                onChange: (e_6)=>updatePracticeSchedule(index_2, 'date', e_6.target.value || ''),
                                                                className: "w-full px-3 py-2 border border-gray-300 rounded-lg",
                                                                autoComplete: "off",
                                                                required: true
                                                            }, `date-${index_2}-${schedule_0.date || 'empty'}`, false, {
                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                lineNumber: 520,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 518,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-700 mb-1",
                                                                children: "開始時間 (24小時制)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                lineNumber: 523,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: parseTime(schedule_0.start_time).hour,
                                                                        onChange: (e_7)=>updateTime(index_2, 'start_time', 'hour', e_7.target.value),
                                                                        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg",
                                                                        required: true,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "",
                                                                                children: "請選擇"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                                lineNumber: 526,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            generateHourOptions().map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: opt.value,
                                                                                    children: opt.label
                                                                                }, opt.value, false, {
                                                                                    fileName: "[project]/src/app/project/create/page.tsx",
                                                                                    lineNumber: 527,
                                                                                    columnNumber: 61
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                                        lineNumber: 525,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: parseTime(schedule_0.start_time).minute,
                                                                        onChange: (e_8)=>updateTime(index_2, 'start_time', 'minute', e_8.target.value),
                                                                        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg",
                                                                        required: true,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "",
                                                                                children: "請選擇"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                                lineNumber: 530,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            generateMinuteOptions().map((opt_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: opt_0.value,
                                                                                    children: opt_0.label
                                                                                }, opt_0.value, false, {
                                                                                    fileName: "[project]/src/app/project/create/page.tsx",
                                                                                    lineNumber: 531,
                                                                                    columnNumber: 65
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                                        lineNumber: 529,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                lineNumber: 524,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 522,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-700 mb-1",
                                                                children: "結束時間 (24小時制)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                lineNumber: 536,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: parseTime(schedule_0.end_time).hour,
                                                                        onChange: (e_9)=>updateTime(index_2, 'end_time', 'hour', e_9.target.value),
                                                                        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg",
                                                                        required: true,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "",
                                                                                children: "請選擇"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                                lineNumber: 539,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            generateHourOptions().map((opt_1)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: opt_1.value,
                                                                                    children: opt_1.label
                                                                                }, opt_1.value, false, {
                                                                                    fileName: "[project]/src/app/project/create/page.tsx",
                                                                                    lineNumber: 540,
                                                                                    columnNumber: 63
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                                        lineNumber: 538,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: parseTime(schedule_0.end_time).minute,
                                                                        onChange: (e_10)=>updateTime(index_2, 'end_time', 'minute', e_10.target.value),
                                                                        className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg",
                                                                        required: true,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "",
                                                                                children: "請選擇"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                                lineNumber: 543,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            generateMinuteOptions().map((opt_2)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: opt_2.value,
                                                                                    children: opt_2.label
                                                                                }, opt_2.value, false, {
                                                                                    fileName: "[project]/src/app/project/create/page.tsx",
                                                                                    lineNumber: 544,
                                                                                    columnNumber: 65
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                                        lineNumber: 542,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                                lineNumber: 537,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 535,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>removePracticeSchedule(index_2),
                                                        className: "px-3 py-2 text-red-500 hover:text-red-700 whitespace-nowrap",
                                                        children: "刪除"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 548,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, index_2, true, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 517,
                                                columnNumber: 65
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 516,
                                        columnNumber: 22
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/project/create/page.tsx",
                                lineNumber: 507,
                                columnNumber: 11
                            }, this),
                            formData.song_id && songIdols.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl shadow-md p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-bold text-gray-800 mb-4",
                                        children: "選擇你要跳的位置 *"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 557,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600 mb-4",
                                        children: "請選擇你要跳的位置，剩下的位置將會自動成為要徵的位置"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 558,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: selectedPosition,
                                        onChange: (e_11)=>handleSelectPosition(e_11.target.value),
                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                        required: formData.song_id ? true : false,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "請選擇位置"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 562,
                                                columnNumber: 17
                                            }, this),
                                            songIdols.map((idol_1)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: idol_1.idol_id,
                                                    children: [
                                                        idol_1.stage_name,
                                                        " (",
                                                        idol_1.group_name,
                                                        ")"
                                                    ]
                                                }, idol_1.idol_id, true, {
                                                    fileName: "[project]/src/app/project/create/page.tsx",
                                                    lineNumber: 563,
                                                    columnNumber: 42
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 561,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/project/create/page.tsx",
                                lineNumber: 556,
                                columnNumber: 56
                            }, this),
                            targetPositions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl shadow-md p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-bold text-gray-800 mb-4",
                                        children: "要徵的位置"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 571,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600 mb-4",
                                        children: "以下位置將開放招募（已排除你選擇的位置）"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 572,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: targetPositions.map((position, index_3)=>{
                                            const idol_2 = songIdols.find((i_2)=>i_2.idol_id.toString() === position.idol_id);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-3 items-center p-3 bg-purple-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-20",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-gray-700",
                                                            children: [
                                                                "位置 ",
                                                                position.target_seq
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/project/create/page.tsx",
                                                            lineNumber: 580,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 579,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-800 font-medium",
                                                            children: idol_2 ? `${idol_2.stage_name} (${idol_2.group_name})` : '未知'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/create/page.tsx",
                                                            lineNumber: 583,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/create/page.tsx",
                                                        lineNumber: 582,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, index_3, true, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 578,
                                                columnNumber: 22
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 575,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/project/create/page.tsx",
                                lineNumber: 570,
                                columnNumber: 42
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl shadow-md p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-bold text-gray-800 mb-4",
                                        children: "伴舞需求"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 594,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600 mb-4",
                                        children: "請輸入需要招募的伴舞人數（idol_id 為 NULL 的伴舞）"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 595,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                children: "伴舞數量 *"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                value: dancerCount,
                                                onChange: (e_12)=>setDancerCount(e_12.target.value),
                                                min: "0",
                                                className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 600,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-2 text-xs text-gray-500",
                                                children: "伴舞將在偶像位置之後自動編號"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/project/create/page.tsx",
                                                lineNumber: 601,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/project/create/page.tsx",
                                lineNumber: 593,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>router.back(),
                                        className: "flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300",
                                        children: "取消"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 609,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: loading,
                                        className: "flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50",
                                        children: loading ? '建立中...' : '建立專案'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/create/page.tsx",
                                        lineNumber: 612,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/project/create/page.tsx",
                                lineNumber: 608,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/project/create/page.tsx",
                        lineNumber: 446,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/project/create/page.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/project/create/page.tsx",
                lineNumber: 619,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/project/create/page.tsx",
        lineNumber: 433,
        columnNumber: 10
    }, this);
}
_s(CreateProjectPage, "whfj1cdfwy7Iy6tGQXLtR9VP5/E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = CreateProjectPage;
var _c;
__turbopack_context__.k.register(_c, "CreateProjectPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_59f763a4._.js.map