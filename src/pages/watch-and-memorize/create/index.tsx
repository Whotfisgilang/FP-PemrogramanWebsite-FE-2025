import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

function CreateWatchAndMemorize() {
  const navigate = useNavigate();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [gameImages, setGameImages] = useState<File[]>([]);
  
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
    const indexes = value.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i) && i >= 0 && i < gameImages.length);
    if (indexes.length === 3) {
      updateQuestion(qIndex, 'shown_image_array_indexes', indexes);
    }
  };

  const handleSubmit = async (publish = false) => {
    setFormErrors({});

    if (!thumbnail) {
      toast.error("Thumbnail is required");
      return;
    }

    // if (gameImages.length < 9) {
    //   toast.error("At least 9 game images are required");
    //   return;
    // }

    if (!name.trim() || name.length < 3) {
      toast.error("Game name must be at least 3 characters");
      return;
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
      formData.append('thumbnail_image', thumbnail);
      gameImages.forEach((file) => {
        formData.append('files_to_upload', file);
      });
      
      // Questions as JSON
      formData.append('questions', JSON.stringify(questions));

      await api.post('/api/game/game-type/watch-and-memorize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Watch and Memorize game created successfully!");
      navigate("/my-projects");
      
    } catch (error: any) {
      console.error("Failed to create game:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create game. Please try again.");
      }
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-white h-fit w-full flex justify-between items-center px-8 py-4">
        <Button
          size="sm"
          variant="ghost"
          className="hidden md:flex"
          onClick={() => navigate("/create-projects")}
        >
          <ArrowLeft /> Back
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="block md:hidden"
          onClick={() => navigate("/create-projects")}
        >
          <ArrowLeft />
        </Button>
      </div>
      
      <div className="w-full h-full p-8 justify-center items-center flex flex-col">
        <div className="max-w-3xl w-full space-y-6">
          <div>
            <Typography variant="h3">Create Watch & Memorize Game</Typography>
            <Typography variant="p" className="mt-2">
              Create a memory game where players watch and memorize images, then select them from a grid
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
              {formErrors["name"] && (
                <p className="text-sm text-red-500">{formErrors["name"]}</p>
              )}
            </div>
            
            <TextareaField
              label="Description"
              placeholder="Describe your memory game"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <div>
              <Dropzone
                required
                label="Thumbnail Image"
                allowedTypes={["image/png", "image/jpeg"]}
                maxSize={2 * 1024 * 1024}
                onChange={(file) => setThumbnail(file)}
              />
              {formErrors["thumbnail"] && (
                <p className="text-sm text-red-500">{formErrors["thumbnail"]}</p>
              )}
            </div>
          </div>

          {/* Game Images */}
          <div className="bg-white w-full h-full p-6 space-y-6 rounded-xl border">
            <div>
              <Typography variant="h4">Game Images</Typography>
              <Typography variant="small" className="text-slate-500">
                Upload exactly 9 images for your memory game. Players will need to memorize and select these images.
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 9 }, (_, index) => (
                <div key={index}>
                  <Dropzone
                    required
                    label={`Image ${index + 1}`}
                    allowedTypes={["image/png", "image/jpeg"]}
                    maxSize={2 * 1024 * 1024}
                    defaultValue={gameImages[index] || null}
                    onChange={(file) => {
                      setGameImages(prev => {
                        const newImages = [...prev];
                        if (file) {
                          newImages[index] = file;
                        } else {
                          newImages.splice(index, 1);
                        }
                        return newImages;
                      });
                    }}
                  />
                </div>
              ))}
            </div>
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
                  className={`${
                    questions.length === 1
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
                  <Typography variant="small" className="text-slate-500 mt-1">
                    Enter 3 image indexes separated by commas (0-{gameImages.length - 1})
                  </Typography>
                </div>

                <div>
                  <Label>Grid Images (9 indexes)</Label>
                  <Input
                    placeholder="0, 1, 2, 3, 4, 5, 6, 7, 8"
                    value={q.grid_image_array_indexes.join(', ')}
                    onChange={(e) => {
                      const indexes = e.target.value.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i) && i >= 0 && i < gameImages.length);
                      if (indexes.length === 9) {
                        updateQuestion(qIndex, 'grid_image_array_indexes', indexes);
                      }
                    }}
                  />
                  <Typography variant="small" className="text-slate-500 mt-1">
                    Enter 9 image indexes separated by commas
                  </Typography>
                </div>

                <div>
                  <Label>Display Time (ms)</Label>
                  <Input
                    type="number"
                    placeholder="3000"
                    value={q.time_to_show_ms}
                    onChange={(e) => updateQuestion(qIndex, 'time_to_show_ms', parseInt(e.target.value) || 3000)}
                  />
                  <Typography variant="small" className="text-slate-500 mt-1">
                    How long to show the images (milliseconds)
                  </Typography>
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
                <Typography variant="small" className="text-slate-500 mt-1">
                  Total game time in milliseconds
                </Typography>
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
                <Typography variant="small">Randomize question order for each player</Typography>
              </div>
              <Switch
                checked={settings.isQuestionRandomized}
                onCheckedChange={(val) => setSettings(prev => ({ ...prev, isQuestionRandomized: val }))}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <Label>Shuffle Images</Label>
                <Typography variant="small">Randomize image positions in grid</Typography>
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
                  <AlertDialogAction onClick={() => navigate("/create-projects")}>
                    Discard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={!name.trim() || !thumbnail}
            >
              <SaveIcon /> Save Draft
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="bg-black text-white"
              onClick={() => handleSubmit(true)}
              disabled={!name.trim() || !thumbnail}
            >
              <EyeIcon /> Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateWatchAndMemorize;