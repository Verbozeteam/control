set -e
cp ../android/app/src/main/java/com/verbozecontrol/socket/CommunicationManager.java com/verbozecontrol/socket/
mkdir -p build/
javac -Xlint:unchecked -d build/ -cp ".:lib/json-simple-1.1.1.jar" com/verbozecontrol/MainApplication.java
cp lib/json-simple-1.1.1.jar build/
cd build
java -cp ".:json-simple-1.1.1.jar" com.verbozecontrol.MainApplication