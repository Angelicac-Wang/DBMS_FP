module.exports = [
"[project]/src/app/admin/songs/[id]/edit/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditSongPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAdminAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAdminAuth.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function EditSongPage() {
    const { isAdmin, loading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAdminAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAdminAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const songId = params.id;
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [groups, setGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [idols, setIdols] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        title: '',
        title_kr: '',
        release_date: '',
        duration: '',
        difficulty_level: '',
        spotify_url: '',
        youtube_original_url: ''
    });
    const [selectedGroups, setSelectedGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedIdols, setSelectedIdols] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isAdmin && songId) {
            fetchGroups();
            fetchIdols();
            fetchSong();
        }
    }, [
        isAdmin,
        songId
    ]);
    const fetchGroups = async ()=>{
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('kpop_groups').select('group_id, group_name').order('group_name');
        if (data) setGroups(data);
    };
    const fetchIdols = async ()=>{
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('kpop_idols').select(`
        idol_id,
        stage_name,
        kpop_groups!inner(group_name)
      `).limit(1000);
        if (data) {
            const idolsData = data.map((item)=>({
                    idol_id: item.idol_id,
                    stage_name: item.stage_name,
                    group_name: item.kpop_groups?.group_name || ''
                }));
            setIdols(idolsData);
        }
    };
    const fetchSong = async ()=>{
        try {
            setLoading(true);
            const { data: songData, error: songError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('kpop_songs').select('*').eq('song_id', parseInt(songId)).single();
            if (songError) throw songError;
            if (songData) {
                setFormData({
                    title: songData.title,
                    title_kr: songData.title_kr,
                    release_date: songData.release_date,
                    duration: songData.duration.toString(),
                    difficulty_level: songData.difficulty_level.toString(),
                    spotify_url: songData.spotify_url || '',
                    youtube_original_url: songData.youtube_original_url
                });
                // 獲取現有的團體關聯
                const { data: songGroups } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('song_group').select('group_id').eq('song_id', parseInt(songId));
                if (songGroups) {
                    setSelectedGroups(songGroups.map((sg)=>sg.group_id));
                }
                // 獲取現有的偶像關聯
                const { data: songIdols } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('song_idol').select('idol_id').eq('song_id', parseInt(songId));
                if (songIdols) {
                    setSelectedIdols(songIdols.map((si)=>si.idol_id));
                }
            }
        } catch (err) {
            setError('載入失敗：' + (err.message || '未知錯誤'));
        } finally{
            setLoading(false);
        }
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            // 更新歌曲
            const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('kpop_songs').update({
                title: formData.title,
                title_kr: formData.title_kr,
                release_date: formData.release_date,
                duration: parseInt(formData.duration),
                difficulty_level: parseInt(formData.difficulty_level),
                spotify_url: formData.spotify_url || null,
                youtube_original_url: formData.youtube_original_url
            }).eq('song_id', parseInt(songId));
            if (updateError) throw updateError;
            // 更新團體關聯（先刪除再新增）
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('song_group').delete().eq('song_id', parseInt(songId));
            if (selectedGroups.length > 0) {
                const songGroups = selectedGroups.map((groupId)=>({
                        song_id: parseInt(songId),
                        group_id: groupId
                    }));
                const { error: groupError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('song_group').insert(songGroups);
                if (groupError) throw groupError;
            }
            // 更新偶像關聯（先刪除再新增）
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('song_idol').delete().eq('song_id', parseInt(songId));
            if (selectedIdols.length > 0) {
                const songIdols = selectedIdols.map((idolId)=>({
                        song_id: parseInt(songId),
                        idol_id: idolId
                    }));
                const { error: idolError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('song_idol').insert(songIdols);
                if (idolError) throw idolError;
            }
            alert('歌曲已成功更新');
            router.push(`/admin/songs/${songId}`);
        } catch (err) {
            setError('更新失敗：' + (err.message || '未知錯誤'));
        } finally{
            setSaving(false);
        }
    };
    const handleDelete = async ()=>{
        if (!confirm('確定要刪除此歌曲嗎？此操作無法復原。')) {
            return;
        }
        try {
            // 檢查是否有關聯的專案
            const { data: projects } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('project').select('p_id').eq('song_id', parseInt(songId)).limit(1);
            if (projects && projects.length > 0) {
                alert('無法刪除：此歌曲有關聯的專案，請先處理相關專案。');
                return;
            }
            const { error: deleteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('kpop_songs').delete().eq('song_id', parseInt(songId));
            if (deleteError) throw deleteError;
            alert('歌曲已成功刪除');
            router.push('/admin/songs');
        } catch (err) {
            alert('刪除失敗：' + (err.message || '未知錯誤'));
        }
    };
    const toggleGroup = (groupId)=>{
        setSelectedGroups((prev)=>prev.includes(groupId) ? prev.filter((id)=>id !== groupId) : [
                ...prev,
                groupId
            ]);
    };
    const toggleIdol = (idolId)=>{
        setSelectedIdols((prev)=>prev.includes(idolId) ? prev.filter((id)=>id !== idolId) : [
                ...prev,
                idolId
            ]);
    };
    if (authLoading || !isAdmin) {
        return null;
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                    lineNumber: 236,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-4 text-gray-600",
                    children: "載入中..."
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                    lineNumber: 237,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
            lineNumber: 235,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold text-gray-900",
                        children: "編輯歌曲"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.back(),
                        className: "text-gray-600 hover:text-gray-800",
                        children: "← 返回"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                        lineNumber: 246,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                lineNumber: 244,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-red-50 border border-red-200 text-red-600 rounded-lg p-4",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                lineNumber: 255,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "bg-white rounded-lg shadow p-6 space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "歌曲名稱（英文） *"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: formData.title,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                title: e.target.value
                                            }),
                                        maxLength: 50,
                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 266,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 262,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "歌曲名稱（韓文） *"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 277,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: formData.title_kr,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                title_kr: e.target.value
                                            }),
                                        maxLength: 50,
                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 280,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 276,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "發行日期 *"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 291,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: formData.release_date,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                release_date: e.target.value
                                            }),
                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 294,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 290,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "時長（秒） *"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 304,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        value: formData.duration,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                duration: e.target.value
                                            }),
                                        min: "1",
                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 307,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 303,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "難度等級 (0-10) *"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 318,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        value: formData.difficulty_level,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                difficulty_level: e.target.value
                                            }),
                                        min: "0",
                                        max: "10",
                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 321,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 317,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "Spotify URL"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 333,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: formData.spotify_url,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                spotify_url: e.target.value
                                            }),
                                        maxLength: 100,
                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 336,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 332,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "YouTube 原始影片 URL *"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 346,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "url",
                                        value: formData.youtube_original_url,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                youtube_original_url: e.target.value
                                            }),
                                        maxLength: 100,
                                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                        lineNumber: 349,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 345,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                        lineNumber: 261,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium text-gray-700 mb-2",
                                children: "演唱團體（可多選）"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 362,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto",
                                children: groups.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-500",
                                    children: "載入中..."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                    lineNumber: 367,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: groups.map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "flex items-center space-x-2 cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: selectedGroups.includes(group.group_id),
                                                    onChange: ()=>toggleGroup(group.group_id),
                                                    className: "rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                                    lineNumber: 372,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm text-gray-900",
                                                    children: group.group_name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                                    lineNumber: 378,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, group.group_id, true, {
                                            fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                            lineNumber: 371,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                    lineNumber: 369,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 365,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                        lineNumber: 361,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium text-gray-700 mb-2",
                                children: "演唱偶像（可多選）"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 388,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto",
                                children: idols.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-500",
                                    children: "載入中..."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                    lineNumber: 393,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: idols.map((idol)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "flex items-center space-x-2 cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: selectedIdols.includes(idol.idol_id),
                                                    onChange: ()=>toggleIdol(idol.idol_id),
                                                    className: "rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm text-gray-900",
                                                    children: [
                                                        idol.stage_name,
                                                        " (",
                                                        idol.group_name,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                                    lineNumber: 404,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, idol.idol_id, true, {
                                            fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                            lineNumber: 397,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                    lineNumber: 395,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 391,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                        lineNumber: 387,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleDelete,
                                className: "bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700",
                                children: "刪除歌曲"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 415,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>router.back(),
                                className: "flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300",
                                children: "取消"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 422,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: saving,
                                className: "flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50",
                                children: saving ? '儲存中...' : '儲存變更'
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                                lineNumber: 429,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                        lineNumber: 414,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
                lineNumber: 260,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin/songs/[id]/edit/page.tsx",
        lineNumber: 243,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_app_admin_songs_%5Bid%5D_edit_page_tsx_ea9b85fc._.js.map