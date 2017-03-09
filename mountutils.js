var fs = require('fs');
var exec = require('child_process').exec;
/**
 * mountutils provides wrappers around the mount and umount utiltities
 * in Linux, and also provides some helper functions.
 *
 */


/**
 * quotePath
 *
 * Properly single-quote a path so it can be safely used in a shell exec().
 * Shell quoting rules requires this to be done by:
 * splitting on any single quotes, wrapping each piece in single quotes
 * and joining the pieces with escaped single quotes.
 *
 * @param path      string  The device or filesystem path to quote
 *
 */
exports.quotePath = function(path) {
  var pieces = path.split("'");
  var output = '';
  var n = pieces.length;
  for (var i=0; i<n; i++) {
    output = output + "'" + pieces[i] + "'";
    if (i< (n-1)) output = output + "\\'";
  }
  return output;
}

/**
 * isMounted
 *
 * Check if device or mountpoint is currently mounted and return details.
 *
 * @param path      string  The device or filesystem path to check
 * @param isDevice  boolean Look for a device.  If false, look for a mountpoint
 *
 */

exports.isMounted = function(path, isDevice) {
  // Sanity checks - if we're looking for a filesystem path that doesn't 
  // exist, it's probably not mounted...
  if (!isDevice && !fs.existsSync(path)) {
    return({"mounted": false, "error": "Path does not exist"});
  }
  // Need mtab to check existing mounts
  if (!fs.existsSync("/etc/mtab")) {
    return({"mounted": false, "error": "Can't read mtab"});
  }

  var mtab = fs.readFileSync("/etc/mtab", { 'encoding': 'ascii' }).split("\n");
  // Interate through and find the one we're looking for
  for (i in mtab) {
    var mountDetail = mtab[i].split(" ");
    // Does the appropriate field match?  Exact match only.
    if ((isDevice && (mountDetail[0]==path)) || (!isDevice && (mountDetail[1]==path))) {
      return({
        "mounted": true,
        "device": mountDetail[0],
        "mountpoint": mountDetail[1],
        "fstype": mountDetail[2],
        "fsopts": mountDetail[3]
      });
    }
  }
  // Didn't find it
  return({"mounted":false});
}

/**
 *
 * mount - attempts to mount a device
 *
 * @param dev   string  device to be mounted
 * @param path  string  mountpoint for device
 * @param options object  options (see below)
 * @param callback function called when mount completes
 *
 * Valid options:
 *   fstype: filesystem type, otherwise autodetected
 *   readonly: mount device read only
 *   fsopts: mount options to be passed to mount
 *   mountPath: path to mount binary
 *   sudoPath: path to sudo binary
 *   noSudo: do not use sudo when calling binaries (default use)
 *   createDir: create path if it doesn't exist (default not)
 *   dirMode: mode to use for dir if we need to create
 *
 */

exports.mount = function(dev, path, options, callback) {
  // See if there is already something mounted at the path
  var mountInfo = this.isMounted(path,false);
  if (mountInfo.mounted) {
    callback({"error": "Something is already mounted on " + path});
    return;
  }

  // See if the mountpoint exists.  If not, do we create?
  if (!fs.existsSync(path)) {
    if (options.createDir) {
      var mode = "0777";
      if (options.dirMode) {
        mode = options.dirMode;
      }
      fs.mkdirSync(path,mode);
    } else {
      callback({"error": "Mount directory does not exist"});
      return;
    }
  }
  // Make sure mountpoint is a directory
  if (!fs.statSync(path).isDirectory()) {
    callback({"error": "Mountpoint is not a directory"});
    return;
  }

  var qdev = this.quotePath(dev);
  var qpath = this.quotePath(path);
  // Build the command line
  var cmd = (options.noSudo?"":
      (options.sudoPath?options.sudoPath:"/usr/bin/sudo")+" ") + 
      (options.mountPath?options.mountPath:"/bin/mount") + " " +
      (options.readonly?"-r ":"") + 
      (options.fstype?"-t " + options.fstype + " ":"") +
      (options.fsopts?"-o " + options.fsopts + " ":"") +
      qdev + " " + qpath;

  // Let's do it!
  var mountProc = exec(cmd, function(error, stdout, stderr) {
    if (error !== null) {
      callback({ "error": "exec error " + error });
    } else {
      callback({ "OK": true });
    }
  });
}

/**
 *
 * umount - attempts to unmount a device
 *
 * @param path  string  mountpoint to unmount
 * @param isDevice boolean  path indicates a device, not a mountpoint (default false)
 * @param options object  options (see below)
 * @param callback function called when umount completes
 *
 *   umountPath: path to umount binary
 *   sudoPath: path to sudo binary
 *   noSudo: do not use sudo when calling binaries (default use)
 *   removeDir: remove mountpoint after umount (default no)
 *
 */

exports.umount = function(path, isDevice, options, callback) {
  // See if it's mounted
  var mountInfo = this.isMounted(path,isDevice);
  if (!mountInfo.mounted) {
    callback({"OK": true});
    return;
  }

  var qpath = this.quotePath(path);
  // Build the command line
  var cmd = (options.noSudo?"":
      (options.sudoPath?options.sudoPath:"/usr/bin/sudo")+" ") + 
      (options.umountPath?options.umountPath:"/bin/umount") + " " + qpath;

  // Let's do it!
  var umountProc = exec(cmd, function(error, stdout, stderr) {
    if (error !== null) {
      callback({ "error": "exec error " + error });
    } else {
      // Remove the mountpoint if the option was given
      if (options.removeDir) {
        fs.rmdirSync(mountInfo.mountpoint);
      }
      callback({ "OK": true });
    }
  });
}
