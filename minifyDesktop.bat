@echo off
set base=U:\ffPreview\web\
set call=java -jar U:\jquery\yuicompressor-2.4.1.jar -o

echo ----- START MINIFICATION -----
CALL %call% %base%ffPreview.min.js %base%ffPreview.js
echo ----- END MINIFICATION -----