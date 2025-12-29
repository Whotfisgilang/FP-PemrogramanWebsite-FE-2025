import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { TextareaField } from "@/components/ui/textarea-field";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import Dropzone from "@/components/ui/dropzone";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Plus, SaveIcon, Trash2, X, EyeIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import api from "@/api/axios";

interface Question {
    shown_image_array_indexes: number[];
    grid_image_array_indexes: number[];
    time_to_show_ms: number;
}

function EditWatchAndMemorize() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // Thumbnail: Can be string (existing) or File (new)
    const [thumbnail, setThumbnail] = useState<File | string | null>(null);

    // Image State Split
    const [existingImages, setExistingImages] = useState<(string | null)[]>(Array(9).fill(null));
    const [newImages, setNewImages] = useState<(File | null)[]>(Array(9).fill(null));
    const [isReplacingImages, setIsReplacingImages] = useState(false);

    const [questions, setQuestions] = useState<Question[]>([
        {
            shown_image_array_indexes: [0, 1, 2],
            grid_image_array_indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            time_to_show_ms: 3000,
        },
    ]);

    const [settings, setSettings] = useState({
        isPublishImmediately: false,
        isQuestionRandomized: false,
        isAnswerRandomized: false,
        scorePerQuestion: 1,
        durationMs: 60000,
    });

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const res = await api.get(`/game/game-type/watch-and-memorize/${id}`);
                const data = res.data.data;

                setName(data.name || "");
                setDescription(data.description || "");

                if (data.thumbnail_image) {
                    const thumbUrl = data.thumbnail_image;
                    if (thumbUrl.startsWith("http") || thumbUrl.startsWith("data:")) {
                        setThumbnail(thumbUrl);
                    } else {
                        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
                        const cleanBase = baseUrl.replace(/\/api$/, "").replace(/\/+$/, "");
                        const cleanPath = thumbUrl.replace(/^\/+/, "");
                        setThumbnail(`${cleanBase}/${cleanPath}`);
                    }
                }

                if (data.game_json) {
                    const json = data.game_json;

                    // Settings
                    setSettings({
                        isPublishImmediately: !!data.is_published,
                        isQuestionRandomized: !!json.settings?.is_question_randomized,
                        isAnswerRandomized: !!json.settings?.is_answer_randomized,
                        scorePerQuestion: json.settings?.score_per_question ?? 1,
                        durationMs: json.settings?.duration_ms ?? 60000,
                    });

                    // Images
                    if (Array.isArray(json.images)) {
                        const loadedImages = json.images.map((img: any) => {
                            const url = img.url || img.image;
                            if (!url) return null;
                            if (url.startsWith("http") || url.startsWith("data:")) return url;

                            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
                            const cleanBase = baseUrl.replace(/\/api$/, "").replace(/\/+$/, "");
                            const cleanPath = url.replace(/^\/+/, "");
                            return `${cleanBase}/${cleanPath}`;
                        });
                        // Ensure exactly 9 slots
                        const filledImages = [...loadedImages];
                        while (filledImages.length < 9) filledImages.push(null);
                        setExistingImages(filledImages);
                    }

                    // Questions
                    if (Array.isArray(json.questions)) {
                        const mappedQuestions = json.questions.map((q: any) => {
                            const getIndex = (imgId: string) => {
                                // Backend stores IDs like 'img-001', 'img-002'.
                                // We find the index in json.images where id matches
                                const idx = json.images.findIndex((im: any) => im.id === imgId);
                                return idx >= 0 ? idx : 0;
                            };

                            return {
                                shown_image_array_indexes: q.shown_image_ids?.map((id: string) => getIndex(id)) || [],
                                grid_image_array_indexes: q.grid_image_ids?.map((id: string) => getIndex(id)) || [],
                                time_to_show_ms: q.time_to_show_ms || 3000
                            };
                        });
                        setQuestions(mappedQuestions);
                    }
                }
            } catch (err) {
                console.error("Failed to load game:", err);
                toast.error("Failed to load game data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                shown_image_array_indexes: [0, 1, 2],
                grid_image_array_indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                time_to_show_ms: 3000,
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        setQuestions((prev) =>
            prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
        );
    };

    const handleShownImagesChange = (qIndex: number, value: string) => {
        const indexes = value.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i) && i >= 0 && i < 9);
        if (indexes.length === 3) {
            updateQuestion(qIndex, 'shown_image_array_indexes', indexes);
        }
    };

    const handleSubmit = async (publish = false) => {

        if (!thumbnail) {
            toast.error("Thumbnail is required");
            return;
        }

        if (!name.trim() || name.length < 3) {
            toast.error("Game name must be at least 3 characters");
            return;
        }

        // Logic check:
        // If isReplacingImages is TRUE, we must have 9 valid Files in newImages.
        // If FALSE, we send NO images (backend keeps existing).

        let finalFiles: File[] = [];

        if (isReplacingImages) {
            const validFiles = newImages.filter((img): img is File => img instanceof File);
            if (validFiles.length !== 9) {
                toast.error("You selected to replace images. You must upload exactly 9 new images.");
                return;
            }
            finalFiles = validFiles;
        }

        try {
            const formData = new FormData();

            // Basic info
            formData.append('name', name);
            formData.append('description', description);
            formData.append('is_publish_immediately', publish.toString());

            // Settings
            formData.append('duration_ms', settings.durationMs.toString());
            formData.append('is_question_randomized', settings.isQuestionRandomized.toString());
            formData.append('is_answer_randomized', settings.isAnswerRandomized.toString());
            formData.append('score_per_question', settings.scorePerQuestion.toString());

            // Files
            if (thumbnail instanceof File) {
                formData.append('thumbnail_image', thumbnail);
            }

            // Only append files if we are properly replacing them
            if (isReplacingImages && finalFiles.length === 9) {
                finalFiles.forEach((file) => {
                    formData.append('files_to_upload', file);
                });
            }

            // Questions as JSON
            formData.append('questions', JSON.stringify(questions));

            await api.patch(`/game/game-type/watch-and-memorize/${id}`, formData);

            toast.success("Watch and Memorize game updated successfully!");
            navigate("/my-projects");

        } catch (error: any) {
            console.error("Failed to update game:", error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to update game. Please try again.");
            }
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="w-full bg-slate-50 min-h-screen flex flex-col">
            <div className="bg-white h-fit w-full flex justify-between items-center px-8 py-4">
                <Button
                    size="sm"
                    variant="ghost"
                    className="hidden md:flex"
                    onClick={() => navigate("/my-projects")}
                >
                    <ArrowLeft /> Back
                </Button>
            </div>

            <div className="w-full h-full p-8 justify-center items-center flex flex-col">
                <div className="max-w-3xl w-full space-y-6">
                    <div>
                        <Typography variant="h3">Edit Watch & Memorize Game</Typography>
                        <Typography variant="p" className="mt-2">
                            Update your memory game details
                        </Typography>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white w-full h-full p-6 space-y-6 rounded-xl border">
                        <div>
                            <FormField
                                required
                                label="Game Name"
                                placeholder="My Memory Game"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <TextareaField
                            label="Description"
                            placeholder="Describe your memory game"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <div>
                            <Label>Thumbnail Image</Label>
                            <div className="mt-2">
                                <Dropzone
                                    required
                                    label="Thumbnail Image"
                                    allowedTypes={["image/png", "image/jpeg"]}
                                    maxSize={2 * 1024 * 1024}
                                    defaultValue={thumbnail}
                                    onChange={(file) => setThumbnail(file)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Game Images */}
                    <div className="bg-white w-full h-full p-6 space-y-6 rounded-xl border">
                        <div className="flex justify-between items-start">
                            <div>
                                <Typography variant="h4">Game Images</Typography>
                                <Typography variant="small" className="text-slate-500">
                                    {isReplacingImages
                                        ? "Upload exactly 9 new images."
                                        : "Showing existing images. Click 'Replace Images' to upload new ones."}
                                </Typography>
                            </div>
                            <Button
                                size="sm"
                                variant={isReplacingImages ? "ghost" : "outline"}
                                onClick={() => {
                                    setIsReplacingImages(!isReplacingImages);
                                    // Reset new images if cancelling
                                    if (isReplacingImages) {
                                        setNewImages(Array(9).fill(null));
                                    }
                                }}
                            >
                                {isReplacingImages ? "Cancel & Keep Existing" : "Replace Images"}
                            </Button>
                        </div>

                        {!isReplacingImages ? (
                            // View Mode (Existing Images)
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {existingImages.map((imgUrl, index) => (
                                    <div key={index} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden border">
                                        {imgUrl ? (
                                            <>
                                                <img src={imgUrl} alt={`Game Image ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                                    #{index}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Edit Mode (New Images)
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {Array.from({ length: 9 }, (_, index) => (
                                    <div key={index}>
                                        <Dropzone
                                            required
                                            label={`New Image ${index + 1}`}
                                            allowedTypes={["image/png", "image/jpeg"]}
                                            maxSize={2 * 1024 * 1024}
                                            defaultValue={newImages[index] || undefined}
                                            onChange={(file) => {
                                                setNewImages(prev => {
                                                    const updated = [...prev];
                                                    updated[index] = file || null; // Explicitly set null
                                                    return updated;
                                                });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Questions */}
                    <div className="flex justify-between items-center">
                        <Typography variant="p">Questions ({questions.length})</Typography>
                        <Button variant="outline" onClick={addQuestion}>
                            <Plus /> Add Question
                        </Button>
                    </div>

                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white w-full h-full p-6 space-y-6 rounded-xl border">
                            <div className="flex justify-between">
                                <Typography variant="p">Question {qIndex + 1}</Typography>
                                <Trash2
                                    size={20}
                                    className={`${questions.length === 1
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-red-500 cursor-pointer"
                                        }`}
                                    onClick={() => {
                                        if (questions.length > 1) removeQuestion(qIndex);
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Images to Show (3 indexes)</Label>
                                    <Input
                                        placeholder="0, 1, 2"
                                        value={q.shown_image_array_indexes.join(', ')}
                                        onChange={(e) => handleShownImagesChange(qIndex, e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Grid Images (9 indexes)</Label>
                                    <Input
                                        placeholder="0, 1, 2, 3, 4, 5, 6, 7, 8"
                                        value={q.grid_image_array_indexes.join(', ')}
                                        onChange={(e) => {
                                            const indexes = e.target.value.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i) && i >= 0 && i < 9);
                                            if (indexes.length === 9) {
                                                updateQuestion(qIndex, 'grid_image_array_indexes', indexes);
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <Label>Display Time (ms)</Label>
                                    <Input
                                        type="number"
                                        placeholder="3000"
                                        value={q.time_to_show_ms}
                                        onChange={(e) => updateQuestion(qIndex, 'time_to_show_ms', parseInt(e.target.value) || 3000)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Settings */}
                    <div className="bg-white w-full h-full p-6 space-y-6 rounded-xl border">
                        <Typography variant="p">Game Settings</Typography>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Game Duration (ms)</Label>
                                <Input
                                    type="number"
                                    placeholder="60000"
                                    value={settings.durationMs}
                                    onChange={(e) => setSettings(prev => ({ ...prev, durationMs: parseInt(e.target.value) || 60000 }))}
                                />
                            </div>

                            <div>
                                <Label>Score Per Question</Label>
                                <Input
                                    type="number"
                                    placeholder="1"
                                    value={settings.scorePerQuestion}
                                    onChange={(e) => setSettings(prev => ({ ...prev, scorePerQuestion: parseInt(e.target.value) || 1 }))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <Label>Shuffle Questions</Label>
                            </div>
                            <Switch
                                checked={settings.isQuestionRandomized}
                                onCheckedChange={(val) => setSettings(prev => ({ ...prev, isQuestionRandomized: val }))}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <Label>Shuffle Images</Label>
                            </div>
                            <Switch
                                checked={settings.isAnswerRandomized}
                                onCheckedChange={(val) => setSettings(prev => ({ ...prev, isAnswerRandomized: val }))}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end w-full">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                    <X /> Cancel
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to cancel? All unsaved changes will be lost.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => navigate("/my-projects")}>
                                        Discard
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSubmit(false)}
                        >
                            <SaveIcon /> Save Draft
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-black text-white"
                            onClick={() => handleSubmit(true)}
                        >
                            <EyeIcon /> Publish
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditWatchAndMemorize;
