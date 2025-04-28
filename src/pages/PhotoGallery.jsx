import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  Typography, 
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import heic2any from 'heic2any';

const Input = styled('input')({
  display: 'none',
});

// IndexedDB 配置
const DB_NAME = 'photoGalleryDB';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [db, setDb] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  // 初始化 IndexedDB
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      setDb(db);
      // 加载所有照片
      loadPhotos(db);
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // 加载照片
  const loadPhotos = (db) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const loadedPhotos = request.result.map(photo => {
        const blob = new Blob([photo.data], { type: photo.type });
        return {
          url: URL.createObjectURL(blob),
          timestamp: photo.timestamp
        };
      });
      // 按时间戳排序，最新的在前面
      loadedPhotos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPhotos(loadedPhotos);
    };

    request.onerror = (event) => {
      console.error('Error loading photos:', event.target.error);
    };
  };

  // 保存照片到 IndexedDB
  const savePhoto = async (blob, type, timestamp) => {
    if (!db) {
      throw new Error('数据库未初始化');
    }

    try {
      const arrayBuffer = await blob.arrayBuffer();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.add({ 
          data: arrayBuffer, 
          type,
          timestamp 
        });

        request.onsuccess = () => {
          const url = URL.createObjectURL(blob);
          // 将新照片添加到数组开头
          setPhotos(prevPhotos => [{ url, timestamp }, ...prevPhotos]);
          resolve();
        };

        request.onerror = (event) => {
          console.error('IndexedDB save error:', event.target.error);
          reject(new Error('保存图片失败: ' + event.target.error.message));
        };

        transaction.oncomplete = () => {
          console.log('Transaction completed');
        };

        transaction.onerror = (event) => {
          console.error('Transaction error:', event.target.error);
          reject(new Error('数据库事务错误: ' + event.target.error.message));
        };
      });
    } catch (error) {
      console.error('Save photo error:', error);
      throw new Error('保存图片时出错: ' + error.message);
    }
  };

  // 从 IndexedDB 删除照片
  const deletePhoto = (index) => {
    if (!db) return;

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const photos = request.result;
      const photoToDelete = photos[index];
      if (photoToDelete) {
        const deleteRequest = store.delete(photoToDelete.id);
        deleteRequest.onsuccess = () => {
          URL.revokeObjectURL(photos[index]);
          setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
        };
      }
    };
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsConverting(true);
    setTotalFiles(files.length);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let blob;
        let type;
        const timestamp = new Date().toISOString();
        
        console.log(`Uploading file ${i + 1}/${files.length}:`, {
          name: file.name,
          type: file.type,
          size: file.size
        });

        // 检查是否为HEIF/HEIC格式
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
          console.log('Converting HEIF/HEIC to JPEG...');
          try {
            const convertedBlob = await heic2any({
              blob: file,
              toType: "image/jpeg",
              quality: 0.8
            });
            blob = convertedBlob;
            type = 'image/jpeg';
            console.log('Conversion successful');
          } catch (conversionError) {
            console.error('HEIF conversion error:', conversionError);
            throw new Error('HEIF格式转换失败: ' + conversionError.message);
          }
        } else {
          blob = file;
          type = file.type;
        }

        if (!blob) {
          throw new Error('无法获取图片数据');
        }

        console.log('Saving photo to IndexedDB...');
        await savePhoto(blob, type, timestamp);
        setUploadProgress(i + 1);
        console.log('Photo saved successfully');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert(`处理图片时出错: ${error.message}\n请重试或尝试其他格式的图片`);
    } finally {
      setIsConverting(false);
      setUploadProgress(0);
      setTotalFiles(0);
    }
  };

  const handleDeleteClick = (index) => {
    setPhotoToDelete(index);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (photoToDelete !== null) {
      deletePhoto(photoToDelete);
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPhotoToDelete(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, pt: 12 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          照片合集
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <label htmlFor="photo-upload">
              <Input
                accept="image/*,image/heic,image/heif"
                id="photo-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={isConverting}
              />
              <Button
                variant="contained"
                component="span"
                disabled={isConverting}
              >
                上传照片
              </Button>
            </label>
            {isConverting && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  正在处理 {uploadProgress}/{totalFiles} 张照片...
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Box>
          <Grid container spacing={2}>
            {photos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    position: 'relative',
                    '&:hover .delete-button': {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <IconButton
                    className="delete-button"
                    onClick={() => handleDeleteClick(index)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={new Date(photo.timestamp).toLocaleString()}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
          >
            <DialogTitle>确认删除</DialogTitle>
            <DialogContent>
              <Typography>
                确定要删除这张照片吗？此操作无法撤销。
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>取消</Button>
              <Button onClick={handleDeleteConfirm} color="error">
                删除
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
};

export default PhotoGallery; 