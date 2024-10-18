Facebook Photo Batch Downloader

A chrome extension to download all pictures in current scope. This was built with cursor-0.42.3-build-241016kxu9umuir-x86_64 with the following conversation.

1. build a chrome extension to batch download facebook photos in the largest size
2. show the button next to the facebook albums found in current page
3. the button not showing in the photos_by album
4. showing just one button in page is enough
5. clicking the button didn't download any photo, just try to find image link with photo.php inside and simulate clicking to get the large photo
6. random delay the download process in 0.1-0.5 seconds
7. the photo link is opened, but it didn't download the photo
8. add a popup window showing the progress of the download tasks and buttons to pause or resume the process.
9. also add progress and control buttons to replace the downloadBtn
10. The Pause/Resume buttons should change appearence to let user know if it's actived
11. rename the downloaded file with the timestamp of it and format it as YmdHis
12. the timestamp should be found on the page, not current time
13. findPhotoTimestamp() can't find any timestamp, the timestamp text found in the page always has link start with '@https://www.facebook.com/photo/ '
14. give up the findPhotoTimestamp(), just just current timestamp instead
15. the downloaded file is still using original filename, the specified filename not working
16. specify file name in chrome.downloads.download() not work, try rename it in onDeterminingFilename()
17. chrome.tabs.create() is annoying, is it possible to create the link in memory only
18. now it can't download any photo
