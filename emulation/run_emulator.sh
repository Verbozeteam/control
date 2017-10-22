set -e
cp ../android/app/src/main/java/com/verbozecontrol/socket/CommunicationManager.java com/verbozecontrol/socket/
mkdir -p build/
#rm -rf io
#protoc --java_out=. --plugin=protoc-gen-grpc-java=protoc-gen-grpc-java --grpc-java_out=. android_emulator.proto
javac -Xlint:unchecked -d build/ -cp ".:io:lib/json-simple-1.1.1.jar" com/verbozecontrol/MainApplication.java
cp lib/json-simple-1.1.1.jar build/
cd build
java -cp ".:json-simple-1.1.1.jar" com.verbozecontrol.MainApplication