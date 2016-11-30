nasm -g -felf64  ./dist/$1.asm 
gcc -o ./dist/$1 ./dist/$1.o  
./dist/$1
