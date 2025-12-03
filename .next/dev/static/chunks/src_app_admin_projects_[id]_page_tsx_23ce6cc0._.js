(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/admin/projects/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProjectDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAdminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAdminAuth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function ProjectDetailPage() {
    _s();
    const { isAdmin, loading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAdminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAdminAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const projectId = params.id;
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [project, setProject] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [creatorName, setCreatorName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [songTitle, setSongTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [songGroup, setSongGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [songDifficulty, setSongDifficulty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [positions, setPositions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [applications, setApplications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [practiceSchedules, setPracticeSchedules] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [filledCount, setFilledCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectDetailPage.useEffect": ()=>{
            if (isAdmin && projectId) {
                fetchProjectDetail();
            }
        }
    }["ProjectDetailPage.useEffect"], [
        isAdmin,
        projectId
    ]);
    const fetchProjectDetail = async ()=>{
        try {
            setLoading(true);
            // 獲取專案基本資訊
            const { data: projectData, error: projectError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project').select('*').eq('p_id', parseInt(projectId)).single();
            if (projectError) throw projectError;
            setProject(projectData);
            // 獲取創建者名稱
            if (projectData.creator_id) {
                const { data: creator } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('name').eq('u_id', projectData.creator_id).single();
                if (creator) setCreatorName(creator.name);
            }
            // 獲取歌曲資訊
            if (projectData.song_id) {
                const { data: song } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_songs').select('title, difficulty_level').eq('song_id', projectData.song_id).single();
                if (song) {
                    setSongTitle(song.title);
                    setSongDifficulty(song.difficulty_level);
                    // 獲取歌曲的團體
                    const { data: songGroups } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('song_group').select('group_id').eq('song_id', projectData.song_id).limit(1);
                    if (songGroups && songGroups.length > 0) {
                        const { data: group } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_groups').select('group_name').eq('group_id', songGroups[0].group_id).single();
                        if (group) setSongGroup(group.group_name);
                    }
                }
            }
            // 獲取成員名單與位置分配
            const { data: targets } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_target').select('target_seq, idol_id, status').eq('project_id', parseInt(projectId)).order('target_seq');
            if (targets) {
                const positionsData = await Promise.all(targets.map(async (target)=>{
                    let idolName;
                    if (target.idol_id) {
                        const { data: idol } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_idols').select('stage_name').eq('idol_id', target.idol_id).single();
                        if (idol) idolName = idol.stage_name;
                    }
                    // 獲取成員資訊
                    const { data: member } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_members').select('member_id').eq('p_id', parseInt(projectId)).eq('target_seq', target.target_seq).eq('status', 'Y').single();
                    let memberName;
                    if (member) {
                        const { data: user } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('name').eq('u_id', member.member_id).single();
                        if (user) memberName = user.name;
                    }
                    return {
                        target_seq: target.target_seq,
                        idol_id: target.idol_id || undefined,
                        idol_name: idolName,
                        member_id: member?.member_id,
                        member_name: memberName,
                        is_backup: !target.idol_id
                    };
                }));
                setPositions(positionsData);
                setFilledCount(positionsData.filter((p)=>p.member_id).length);
            }
            // 獲取所有申請記錄
            const { data: applicationsData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_applications').select('application_id, applicant_id, target_seq, status, applied_time, review_time').eq('p_id', parseInt(projectId)).order('applied_time', {
                ascending: false
            });
            if (applicationsData) {
                const applicationsWithDetails = await Promise.all(applicationsData.map(async (app)=>{
                    // 獲取申請者名稱
                    const { data: applicant } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('name').eq('u_id', app.applicant_id).single();
                    // 獲取位置對應的偶像名稱
                    const { data: target_0 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_target').select('idol_id').eq('project_id', parseInt(projectId)).eq('target_seq', app.target_seq).single();
                    let idolName_0;
                    if (target_0?.idol_id) {
                        const { data: idol_0 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('kpop_idols').select('stage_name').eq('idol_id', target_0.idol_id).single();
                        if (idol_0) idolName_0 = idol_0.stage_name;
                    }
                    return {
                        ...app,
                        applicant_name: applicant?.name || '未知',
                        idol_name: idolName_0
                    };
                }));
                setApplications(applicationsWithDetails);
            }
            // 獲取練習時間表
            const { data: schedules } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('practice_schedule').select('*').eq('p_id', parseInt(projectId)).order('practice_date');
            if (schedules) setPracticeSchedules(schedules);
        } catch (error) {
            console.error('Error fetching project detail:', error);
        } finally{
            setLoading(false);
        }
    };
    const getStatusText = (status)=>{
        switch(status){
            case 'A':
                return '招募中';
            case 'D':
                return '進行中';
            case 'F':
                return '已完成';
            case 'W':
                return '等待審核';
            case 'R':
                return '已拒絕';
            case 'C':
                return '已取消';
            default:
                return status;
        }
    };
    const formatTime = (time)=>{
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    };
    if (authLoading || !isAdmin) {
        return null;
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                    lineNumber: 220,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-4 text-gray-600",
                    children: "載入中..."
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                    lineNumber: 221,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
            lineNumber: 219,
            columnNumber: 12
        }, this);
    }
    if (!project) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-600",
                    children: "專案不存在"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                    lineNumber: 226,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>router.push('/admin/projects'),
                    className: "mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg",
                    children: "返回列表"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                    lineNumber: 227,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
            lineNumber: 225,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold text-gray-900",
                        children: "專案詳情"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.back(),
                        className: "text-gray-600 hover:text-gray-800",
                        children: "← 返回"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 235,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                lineNumber: 233,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-800 mb-4",
                        children: "基本資料"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "專案 ID"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 245,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: project.p_id
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 246,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 244,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "專案標題"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 249,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: project.porject_title
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 250,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 248,
                                columnNumber: 11
                            }, this),
                            project.discription && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "描述"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 253,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900 mt-1",
                                        children: project.discription
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 254,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 252,
                                columnNumber: 35
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "創建者"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: [
                                            creatorName,
                                            " (ID: ",
                                            project.creator_id,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 258,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 256,
                                columnNumber: 11
                            }, this),
                            songTitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "歌曲"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: [
                                            songTitle,
                                            songGroup && ` - ${songGroup}`,
                                            songDifficulty !== null && ` (難度: ${songDifficulty}/10)`
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 264,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 262,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "目標人數"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 271,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: [
                                            project.target_cnt,
                                            " 人"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 272,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 270,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "狀態"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 275,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: getStatusText(project.status)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 276,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 274,
                                columnNumber: 11
                            }, this),
                            project.practice_location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "練習地點"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 279,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: project.practice_location
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 280,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 278,
                                columnNumber: 41
                            }, this),
                            project.performance_location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "拍攝地點"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 283,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: project.performance_location
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 284,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 282,
                                columnNumber: 44
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "建立時間"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 287,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: new Date(project.create_at).toLocaleString('zh-TW')
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 288,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this),
                            project.update_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "更新時間"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 293,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: new Date(project.update_at).toLocaleString('zh-TW')
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 294,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 292,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 243,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-800 mb-4",
                        children: [
                            "成員名單與位置分配 (",
                            filledCount,
                            "/",
                            positions.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 303,
                        columnNumber: 9
                    }, this),
                    positions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500",
                        children: "尚無位置資料"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 306,
                        columnNumber: 35
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                        children: positions.map((position)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `border rounded-lg p-4 ${position.member_id ? 'border-green-300 bg-green-50' : 'border-gray-200'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-medium text-gray-900",
                                        children: position.is_backup ? `伴舞 ${position.target_seq}` : position.idol_name ? `${position.idol_name} (位置 ${position.target_seq})` : `位置 ${position.target_seq}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 308,
                                        columnNumber: 17
                                    }, this),
                                    position.member_id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-green-700 mt-1",
                                        children: [
                                            "成員：",
                                            position.member_name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 311,
                                        columnNumber: 39
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-500 mt-1",
                                        children: "空缺"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 313,
                                        columnNumber: 28
                                    }, this)
                                ]
                            }, position.target_seq, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 307,
                                columnNumber: 40
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 306,
                        columnNumber: 77
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-800 mb-4",
                        children: [
                            "所有申請記錄 (",
                            applications.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 320,
                        columnNumber: 9
                    }, this),
                    applications.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500",
                        children: "尚無申請記錄"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 321,
                        columnNumber: 38
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: applications.map((app_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-gray-200 rounded-lg p-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-gray-900",
                                                    children: app_0.applicant_name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                                    lineNumber: 325,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-gray-500",
                                                    children: app_0.is_backup ? `伴舞 ${app_0.target_seq}` : app_0.idol_name ? `${app_0.idol_name} (位置 ${app_0.target_seq})` : `位置 ${app_0.target_seq}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-gray-500",
                                                    children: [
                                                        "申請時間：",
                                                        new Date(app_0.applied_time).toLocaleString('zh-TW'),
                                                        app_0.review_time && ` · 審核時間：${new Date(app_0.review_time).toLocaleString('zh-TW')}`
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                                    lineNumber: 331,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                            lineNumber: 324,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `px-2 py-1 text-xs font-semibold rounded-full ${app_0.status === 'W' ? 'bg-yellow-100 text-yellow-800' : app_0.status === 'A' ? 'bg-green-100 text-green-800' : app_0.status === 'R' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`,
                                            children: getStatusText(app_0.status)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                            lineNumber: 336,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                    lineNumber: 323,
                                    columnNumber: 17
                                }, this)
                            }, app_0.application_id, false, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 322,
                                columnNumber: 40
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 321,
                        columnNumber: 80
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                lineNumber: 319,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-800 mb-4",
                        children: [
                            "練習時間表 (",
                            practiceSchedules.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 346,
                        columnNumber: 9
                    }, this),
                    practiceSchedules.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500",
                        children: "尚無練習時間"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 347,
                        columnNumber: 43
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: practiceSchedules.map((schedule)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-gray-200 rounded-lg p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-medium text-gray-900",
                                        children: new Date(schedule.practice_date).toLocaleDateString('zh-TW')
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 349,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600 mt-1",
                                        children: [
                                            formatTime(schedule.start_time),
                                            " - ",
                                            formatTime(schedule.end_time)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 352,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, schedule.schedule_id, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 348,
                                columnNumber: 48
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 347,
                        columnNumber: 85
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                lineNumber: 345,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-800 mb-4",
                        children: "專案進度"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 361,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm text-gray-600",
                                                children: "完成度"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                                lineNumber: 365,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-medium text-gray-900",
                                                children: [
                                                    filledCount,
                                                    " / ",
                                                    positions.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                                lineNumber: 366,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 364,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full bg-gray-200 rounded-full h-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-purple-600 h-2 rounded-full",
                                            style: {
                                                width: `${positions.length > 0 ? filledCount / positions.length * 100 : 0}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                            lineNumber: 371,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 370,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 363,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600",
                                        children: "專案狀態"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 377,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-medium text-gray-900",
                                        children: getStatusText(project.status)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                        lineNumber: 378,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                                lineNumber: 376,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                        lineNumber: 362,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
                lineNumber: 360,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin/projects/[id]/page.tsx",
        lineNumber: 232,
        columnNumber: 10
    }, this);
}
_s(ProjectDetailPage, "x671uMcNFXLCnYlAF+KG1bSJl8Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAdminAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAdminAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = ProjectDetailPage;
var _c;
__turbopack_context__.k.register(_c, "ProjectDetailPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_admin_projects_%5Bid%5D_page_tsx_23ce6cc0._.js.map