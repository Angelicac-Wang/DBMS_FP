(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/admin/projects/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProjectsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAdminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAdminAuth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function ProjectsPage() {
    _s();
    const { isAdmin, loading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAdminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAdminAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [projects, setProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterStatus, setFilterStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterCreator, setFilterCreator] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectsPage.useEffect": ()=>{
            if (isAdmin) {
                fetchProjects();
            }
        }
    }["ProjectsPage.useEffect"], [
        isAdmin
    ]);
    const fetchProjects = async ()=>{
        try {
            setLoading(true);
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project').select('p_id, porject_title, creator_id, song_id, status, target_cnt, create_at');
            // 搜尋
            if (searchQuery) {
                query = query.ilike('porject_title', `%${searchQuery}%`);
            }
            // 篩選狀態
            if (filterStatus) {
                query = query.eq('status', filterStatus);
            }
            query = query.order('create_at', {
                ascending: false
            });
            const { data: projectsData, error: error_0 } = await query;
            if (error_0) throw error_0;
            // 獲取創建者名稱和歌曲名稱
            const projectsWithDetails = await Promise.all((projectsData || []).map(async (project)=>{
                // 獲取創建者名稱
                const { data: creator } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('name').eq('u_id', project.creator_id).single();
                // 獲取歌曲名稱
                let songTitle = undefined;
                if (project.song_id) {
                    const { data: song } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_songs').select('title').eq('song_id', project.song_id).single();
                    songTitle = song?.title;
                }
                return {
                    ...project,
                    creator_name: creator?.name || '未知',
                    song_title: songTitle
                };
            }));
            // 如果有篩選創建者，過濾結果
            let filteredProjects = projectsWithDetails;
            if (filterCreator) {
                filteredProjects = projectsWithDetails.filter((p)=>p.creator_name.toLowerCase().includes(filterCreator.toLowerCase()));
            }
            setProjects(filteredProjects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectsPage.useEffect": ()=>{
            if (isAdmin) {
                fetchProjects();
            }
        }
    }["ProjectsPage.useEffect"], [
        searchQuery,
        filterStatus,
        filterCreator,
        isAdmin
    ]);
    const getStatusText = (status)=>{
        switch(status){
            case 'A':
                return '招募中';
            case 'D':
                return '進行中';
            case 'F':
                return '已完成';
            default:
                return status;
        }
    };
    if (authLoading || !isAdmin) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-3xl font-bold text-gray-900",
                    children: "專案管理"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/projects/page.tsx",
                    lineNumber: 114,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/projects/page.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow p-4 space-y-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                    children: "搜尋專案標題或歌曲名稱"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/projects/page.tsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: searchQuery,
                                    onChange: (e)=>setSearchQuery(e.target.value),
                                    placeholder: "輸入專案標題...",
                                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/projects/page.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/projects/page.tsx",
                            lineNumber: 120,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                    children: "狀態"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/projects/page.tsx",
                                    lineNumber: 125,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: filterStatus,
                                    onChange: (e_0)=>setFilterStatus(e_0.target.value),
                                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "全部"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "A",
                                            children: "招募中"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 128,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "D",
                                            children: "進行中"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "F",
                                            children: "已完成"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/projects/page.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/projects/page.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                    children: "創建者"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/projects/page.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: filterCreator,
                                    onChange: (e_1)=>setFilterCreator(e_1.target.value),
                                    placeholder: "輸入創建者名稱...",
                                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/projects/page.tsx",
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/projects/page.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/projects/page.tsx",
                    lineNumber: 119,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/projects/page.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/page.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-gray-600",
                        children: "載入中..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/page.tsx",
                        lineNumber: 143,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/projects/page.tsx",
                lineNumber: 141,
                columnNumber: 18
            }, this) : projects.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow p-12 text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-600",
                    children: "沒有找到專案"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/projects/page.tsx",
                    lineNumber: 145,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/projects/page.tsx",
                lineNumber: 144,
                columnNumber: 42
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "min-w-full divide-y divide-gray-200",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                        children: "專案標題"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/page.tsx",
                                        lineNumber: 150,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                        children: "創建者"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/page.tsx",
                                        lineNumber: 153,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                        children: "歌曲名稱"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/page.tsx",
                                        lineNumber: 156,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                        children: "狀態"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/page.tsx",
                                        lineNumber: 159,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                        children: "目標人數"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/page.tsx",
                                        lineNumber: 162,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                        children: "建立日期"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/page.tsx",
                                        lineNumber: 165,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",
                                        children: "操作"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/page.tsx",
                                        lineNumber: 168,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/page.tsx",
                                lineNumber: 149,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/projects/page.tsx",
                            lineNumber: 148,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "bg-white divide-y divide-gray-200",
                            children: projects.map((project_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "hover:bg-gray-50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-medium text-gray-900",
                                                children: project_0.porject_title
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/projects/page.tsx",
                                                lineNumber: 176,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 175,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-900",
                                                children: project_0.creator_name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/projects/page.tsx",
                                                lineNumber: 179,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 178,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-900",
                                                children: project_0.song_title || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/projects/page.tsx",
                                                lineNumber: 182,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 181,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `px-2 py-1 text-xs font-semibold rounded-full ${project_0.status === 'A' ? 'bg-blue-100 text-blue-800' : project_0.status === 'D' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`,
                                                children: getStatusText(project_0.status)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/projects/page.tsx",
                                                lineNumber: 185,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 184,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                                            children: [
                                                project_0.target_cnt,
                                                " 人"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 189,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                                            children: new Date(project_0.create_at).toLocaleDateString('zh-TW')
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 192,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/admin/projects/${project_0.p_id}`,
                                                className: "text-purple-600 hover:text-purple-900",
                                                children: "查看詳情"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/projects/page.tsx",
                                                lineNumber: 196,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/page.tsx",
                                            lineNumber: 195,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, project_0.p_id, true, {
                                    fileName: "[project]/src/app/admin/projects/page.tsx",
                                    lineNumber: 174,
                                    columnNumber: 42
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/projects/page.tsx",
                            lineNumber: 173,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/projects/page.tsx",
                    lineNumber: 147,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/projects/page.tsx",
                lineNumber: 146,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin/projects/page.tsx",
        lineNumber: 112,
        columnNumber: 10
    }, this);
}
_s(ProjectsPage, "QsTXdpGAI3bIvEog6ft6GFAOfh8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAdminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAdminAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ProjectsPage;
var _c;
__turbopack_context__.k.register(_c, "ProjectsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_admin_projects_page_tsx_4f049c33._.js.map