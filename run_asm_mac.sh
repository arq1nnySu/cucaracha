~/Documents/dev/nasm-2.12.03rc1/nasm -g -fmacho64  ./dist/$1.asm 
gcc -o ./dist/$1 ./dist/$1.o -march=x86_64 
./dist/$1
