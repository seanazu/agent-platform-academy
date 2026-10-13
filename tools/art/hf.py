"""Small shared helpers for the Higgsfield CLI and the course data."""
import json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
ART_DIR = ROOT / 'tools/art'
SRC = ART_DIR / 'src'  # full-size downloads, kept out of git
sys.path.insert(0, str(ART_DIR))
from scenes import SCENES, ACCENT, HERO_ACCENT  # noqa: E402

REF = 'b407266c-78a6-4625-93dd-301af6ad35bf'  # upload id of the style reference (harness-lab S0-ref.png)
STYLE = ('Use the reference image only for its visual style: the same isometric miniature 3D clay diorama on a small floating dark slate platform, '
         'centered in the frame with generous empty space around it, on the same plain deep midnight navy background, with the same soft matte clay '
         'and frosted glass materials in pearl white and light silver, soft studio lighting and soft shadows. Do not copy its objects. '
         'The AI agent is always the same small friendly white robot with a rounded head and one glowing visor. Engineers are small simple clay '
         'people with no facial features. Accent glow color: {accent}. Calm, premium, tidy and a little playful. '
         'No text, no letters, no numbers, no logos, no writing on any screen, paper or sign. Scene: {scene}')


def hf(*args):
  return subprocess.run(['higgsfield', *args, '--json'], capture_output=True, text=True)


def parse(out):
  d = json.loads(out)
  d = d[0] if isinstance(d, list) else d
  return {'id': d} if isinstance(d, str) else d


def job(jid):
  return parse(hf('generate', 'get', jid).stdout)


def load(path):
  return json.loads(path.read_text()) if path.exists() else {}


def save(path, data):
  path.write_text(json.dumps(data, indent=1) + '\n')


def course():
  return json.load(open(ROOT / 'content/course.json'))


def accents():
  """id -> accent phrase, for the hero, every part and every lesson."""
  out = {'hero': HERO_ACCENT}
  for part in course()['parts']:
    out[part['id']] = ACCENT[part['accent']]
    for lesson in part['lessons']:
      out[lesson['id']] = ACCENT[part['accent']]
  return out


def parts():
  return [p['id'] for p in course()['parts']]


def only(argv):
  """--only hero,p0,p1-1 -> list of ids, or None."""
  for i, a in enumerate(argv):
    if a == '--only': return argv[i + 1].split(',')
    if a.startswith('--only='): return a.split('=', 1)[1].split(',')
  return None
